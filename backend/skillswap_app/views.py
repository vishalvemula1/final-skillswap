# backend/skillswap_app/views.py
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q, Avg, Count
import json

from .models import Profile, Category, Skill, UserSkill, SwapRequest, Review

@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    """User registration"""
    try:
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)
        
        user = User.objects.create_user(username=username, email=email, password=password)
        Profile.objects.create(user=user)  # Create profile automatically
        
        return JsonResponse({'message': 'User registered successfully', 'user_id': user.id})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def user_login(request):
    """User login"""
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            profile = Profile.objects.get(user=user)
            return JsonResponse({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'location': profile.location,
                    'bio': profile.bio
                }
            })
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@require_http_methods(["POST"])
def user_logout(request):
    """User logout"""
    logout(request)
    return JsonResponse({'message': 'Logout successful'})

@require_http_methods(["GET"])
def get_profile(request):
    """Get current user's profile"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        profile = Profile.objects.get(user=request.user)
        user_skills = UserSkill.objects.filter(user=request.user).select_related('skill__category')
        
        skills_data = [{
            'id': us.skill.id,
            'name': us.skill.name,
            'category': us.skill.category.name,
            'can_teach': us.can_teach,
            'experience_level': us.experience_level
        } for us in user_skills]
        
        return JsonResponse({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'bio': profile.bio,
            'location': profile.location,
            'phone': profile.phone,
            'skills': skills_data
        })
    except Profile.DoesNotExist:
        return JsonResponse({'error': 'Profile not found'}, status=404)

@csrf_exempt
@require_http_methods(["POST"])
def update_profile(request):
    """Update user profile"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        data = json.loads(request.body)
        profile, created = Profile.objects.get_or_create(user=request.user)
        
        profile.bio = data.get('bio', profile.bio)
        profile.location = data.get('location', profile.location)
        profile.phone = data.get('phone', profile.phone)
        profile.save()
        
        return JsonResponse({'message': 'Profile updated successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@require_http_methods(["GET"])
def get_categories(request):
    """Get all skill categories"""
    categories = Category.objects.all().values('id', 'name', 'description')
    return JsonResponse({'categories': list(categories)})

@require_http_methods(["GET"])
def get_skills(request):
    """Get skills, optionally filtered by category"""
    category_id = request.GET.get('category_id')
    query = request.GET.get('search', '')
    
    skills = Skill.objects.select_related('category')
    
    if category_id:
        skills = skills.filter(category_id=category_id)
    
    if query:
        skills = skills.filter(Q(name__icontains=query) | Q(description__icontains=query))
    
    skills_data = [{
        'id': skill.id,
        'name': skill.name,
        'category': skill.category.name,
        'category_id': skill.category.id,
        'description': skill.description
    } for skill in skills]
    
    return JsonResponse({'skills': skills_data})

@require_http_methods(["GET"])
def browse_skills(request):
    """Browse skills with teachers and filters"""
    location = request.GET.get('location', '')
    category_id = request.GET.get('category_id')
    search = request.GET.get('search', '')
    
    # Get skills with teacher information
    skills_query = UserSkill.objects.filter(can_teach=True).select_related(
        'skill__category', 'user__profile'
    )
    
    if location:
        skills_query = skills_query.filter(user__profile__location__icontains=location)
    
    if category_id:
        skills_query = skills_query.filter(skill__category_id=category_id)
    
    if search:
        skills_query = skills_query.filter(
            Q(skill__name__icontains=search) | Q(skill__description__icontains=search)
        )
    
    # Group by skill and collect teachers
    skills_dict = {}
    for user_skill in skills_query:
        skill_id = user_skill.skill.id
        if skill_id not in skills_dict:
            skills_dict[skill_id] = {
                'id': skill_id,
                'name': user_skill.skill.name,
                'category': user_skill.skill.category.name,
                'description': user_skill.skill.description,
                'teachers': []
            }
        
        # Get teacher's average rating
        avg_rating = Review.objects.filter(to_user=user_skill.user).aggregate(
            avg_rating=Avg('rating')
        )['avg_rating'] or 0
        
        skills_dict[skill_id]['teachers'].append({
            'id': user_skill.user.id,
            'username': user_skill.user.username,
            'location': user_skill.user.profile.location,
            'experience_level': user_skill.experience_level,
            'avg_rating': round(avg_rating, 1)
        })
    
    return JsonResponse({'skills': list(skills_dict.values())})

@csrf_exempt
@require_http_methods(["POST"])
def send_swap_request(request):
    """Send a skill swap request"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        data = json.loads(request.body)
        to_user_id = data.get('to_user_id')
        requested_skill_id = data.get('requested_skill_id')
        offered_skill_id = data.get('offered_skill_id')
        message = data.get('message', '')
        
        # Check if request already exists
        existing = SwapRequest.objects.filter(
            from_user=request.user,
            to_user_id=to_user_id,
            requested_skill_id=requested_skill_id,
            status='pending'
        ).exists()
        
        if existing:
            return JsonResponse({'error': 'Request already sent'}, status=400)
        
        swap_request = SwapRequest.objects.create(
            from_user=request.user,
            to_user_id=to_user_id,
            requested_skill_id=requested_skill_id,
            offered_skill_id=offered_skill_id,
            message=message
        )
        
        return JsonResponse({'message': 'Swap request sent', 'request_id': swap_request.id})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@require_http_methods(["GET"])
def get_swap_requests(request):
    """Get user's swap requests (sent and received)"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    # Sent requests
    sent = SwapRequest.objects.filter(from_user=request.user).select_related(
        'to_user__profile', 'requested_skill', 'offered_skill'
    )
    
    # Received requests
    received = SwapRequest.objects.filter(to_user=request.user).select_related(
        'from_user__profile', 'requested_skill', 'offered_skill'
    )
    
    sent_data = [{
        'id': req.id,
        'to_user': req.to_user.username,
        'requested_skill': req.requested_skill.name,
        'offered_skill': req.offered_skill.name if req.offered_skill else None,
        'message': req.message,
        'status': req.status,
        'created_at': req.created_at.isoformat()
    } for req in sent]
    
    received_data = [{
        'id': req.id,
        'from_user': req.from_user.username,
        'requested_skill': req.requested_skill.name,
        'offered_skill': req.offered_skill.name if req.offered_skill else None,
        'message': req.message,
        'status': req.status,
        'created_at': req.created_at.isoformat()
    } for req in received]
    
    return JsonResponse({
        'sent_requests': sent_data,
        'received_requests': received_data
    })

@csrf_exempt
@require_http_methods(["POST"])
def update_swap_request(request, request_id):
    """Accept/reject a swap request"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        data = json.loads(request.body)
        status = data.get('status')  # 'accepted', 'rejected', 'completed'
        
        swap_request = SwapRequest.objects.get(id=request_id, to_user=request.user)
        swap_request.status = status
        swap_request.save()
        
        return JsonResponse({'message': f'Request {status}'})
    except SwapRequest.DoesNotExist:
        return JsonResponse({'error': 'Request not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def create_review(request):
    """Create a review after completed swap"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        data = json.loads(request.body)
        swap_request_id = data.get('swap_request_id')
        rating = data.get('rating')
        comment = data.get('comment', '')
        
        # Verify swap request exists and is completed
        swap_request = SwapRequest.objects.get(
            id=swap_request_id,
            from_user=request.user,
            status='completed'
        )
        
        # Check if review already exists
        if Review.objects.filter(from_user=request.user, swap_request=swap_request).exists():
            return JsonResponse({'error': 'Review already exists'}, status=400)
        
        review = Review.objects.create(
            from_user=request.user,
            to_user=swap_request.to_user,
            swap_request=swap_request,
            rating=rating,
            comment=comment
        )
        
        return JsonResponse({'message': 'Review created', 'review_id': review.id})
    except SwapRequest.DoesNotExist:
        return JsonResponse({'error': 'Swap request not found or not completed'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@require_http_methods(["GET"])
def get_reviews(request, user_id):
    """Get reviews for a specific user"""
    try:
        reviews = Review.objects.filter(to_user_id=user_id).select_related(
            'from_user', 'swap_request__requested_skill'
        ).order_by('-created_at')
        
        reviews_data = [{
            'id': review.id,
            'from_user': review.from_user.username,
            'rating': review.rating,
            'comment': review.comment,
            'skill': review.swap_request.requested_skill.name,
            'created_at': review.created_at.isoformat()
        } for review in reviews]
        
        # Calculate average rating
        avg_rating = Review.objects.filter(to_user_id=user_id).aggregate(
            avg_rating=Avg('rating')
        )['avg_rating'] or 0
        
        return JsonResponse({
            'reviews': reviews_data,
            'average_rating': round(avg_rating, 1),
            'total_reviews': len(reviews_data)
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def add_user_skill(request):
    """Add a skill to user's profile"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        data = json.loads(request.body)
        skill_id = data.get('skill_id')
        can_teach = data.get('can_teach', True)
        experience_level = data.get('experience_level', 'Intermediate')
        
        user_skill, created = UserSkill.objects.get_or_create(
            user=request.user,
            skill_id=skill_id,
            defaults={
                'can_teach': can_teach,
                'experience_level': experience_level
            }
        )
        
        if not created:
            user_skill.can_teach = can_teach
            user_skill.experience_level = experience_level
            user_skill.save()
        
        return JsonResponse({'message': 'Skill added to profile'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
