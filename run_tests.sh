#!/bin/bash

echo "================================"
echo "Running SkillSwap Test Suite"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend tests
echo -e "${YELLOW}Running Backend Tests...${NC}"
echo "------------------------"
cd backend
python manage.py test skillswap_app.tests --verbosity=2
BACKEND_EXIT=$?

if [ $BACKEND_EXIT -eq 0 ]; then
    echo -e "${GREEN}✓ Backend tests passed${NC}"
else
    echo -e "${RED}✗ Backend tests failed${NC}"
fi

echo ""

# Frontend tests (commented out for now - can be uncommented when ready)
# echo -e "${YELLOW}Running Frontend Tests...${NC}"
# echo "------------------------"
# cd ../frontend
# npm test -- --watchAll=false --coverage
# FRONTEND_EXIT=$?

# if [ $FRONTEND_EXIT -eq 0 ]; then
#     echo -e "${GREEN}✓ Frontend tests passed${NC}"
# else
#     echo -e "${RED}✗ Frontend tests failed${NC}"
# fi

# Summary
echo ""
echo "================================"
echo "Test Summary"
echo "================================"

if [ $BACKEND_EXIT -eq 0 ]; then
    echo -e "Backend:  ${GREEN}PASSED${NC}"
else
    echo -e "Backend:  ${RED}FAILED${NC}"
fi

# if [ $FRONTEND_EXIT -eq 0 ]; then
#     echo -e "Frontend: ${GREEN}PASSED${NC}"
# else
#     echo -e "Frontend: ${RED}FAILED${NC}"
# fi

# Exit with error if any tests failed
if [ $BACKEND_EXIT -ne 0 ]; then
    exit 1
fi

exit 0
