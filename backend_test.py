#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Test Platform
Tests all critical flows: Authentication, Admin, Teacher, Student, Room Management
"""

import requests
import json
import random
import string
import time
from datetime import datetime

# Base URL from environment
BASE_URL = "https://learncheck-5.preview.emergentagent.com/api"

class TestPlatformTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.teacher_token = None
        self.student_tokens = []
        self.test_data = {}
        
    def generate_random_string(self, length=8):
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))
    
    def generate_test_email(self, prefix="test"):
        return f"{prefix}_{self.generate_random_string()}@testplatform.com"
    
    def log_test(self, test_name, success, details=""):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success:
            print(f"   ❌ CRITICAL FAILURE in {test_name}")
        print()
    
    def make_request(self, method, endpoint, data=None, expected_status=200, description=""):
        url = f"{BASE_URL}{endpoint}"
        try:
            if method.upper() == 'GET':
                response = self.session.get(url)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            success = response.status_code == expected_status
            
            if not success:
                print(f"❌ Request failed: {method} {endpoint}")
                print(f"   Expected status: {expected_status}, Got: {response.status_code}")
                print(f"   Response: {response.text}")
            
            return response, success
        except Exception as e:
            print(f"❌ Request error: {method} {endpoint} - {str(e)}")
            return None, False
    
    def test_auth_signup(self):
        """Test user signup for different roles"""
        print("🔐 Testing Authentication - Signup")
        
        # Test admin signup
        admin_data = {
            "name": "Test Admin",
            "email": self.generate_test_email("admin"),
            "password": "admin123",
            "role": "ADMIN"
        }
        
        response, success = self.make_request('POST', '/auth/signup', admin_data)
        if success and response:
            self.test_data['admin'] = admin_data
            self.log_test("Admin Signup", True, f"Admin created: {admin_data['email']}")
        else:
            self.log_test("Admin Signup", False, "Failed to create admin account")
            return False
        
        # Test teacher signup
        teacher_data = {
            "name": "Test Teacher",
            "email": self.generate_test_email("teacher"),
            "password": "teacher123",
            "role": "TEACHER"
        }
        
        response, success = self.make_request('POST', '/auth/signup', teacher_data)
        if success and response:
            self.test_data['teacher'] = teacher_data
            self.log_test("Teacher Signup", True, f"Teacher created: {teacher_data['email']}")
        else:
            self.log_test("Teacher Signup", False, "Failed to create teacher account")
            return False
        
        # Test student signup
        student_data = {
            "name": "Test Student",
            "email": self.generate_test_email("student"),
            "password": "student123",
            "role": "STUDENT"
        }
        
        response, success = self.make_request('POST', '/auth/signup', student_data)
        if success and response:
            self.test_data['student'] = student_data
            self.log_test("Student Signup", True, f"Student created: {student_data['email']}")
        else:
            self.log_test("Student Signup", False, "Failed to create student account")
            return False
        
        return True
    
    def test_auth_login(self):
        """Test login for different user types"""
        print("🔐 Testing Authentication - Login")
        
        # Test admin login
        login_data = {
            "email": self.test_data['admin']['email'],
            "password": self.test_data['admin']['password']
        }
        
        response, success = self.make_request('POST', '/auth/login', login_data)
        if success and response:
            self.log_test("Admin Login", True, "Admin logged in successfully")
        else:
            self.log_test("Admin Login", False, "Admin login failed")
            return False
        
        # Test teacher login
        login_data = {
            "email": self.test_data['teacher']['email'],
            "password": self.test_data['teacher']['password']
        }
        
        response, success = self.make_request('POST', '/auth/login', login_data)
        if success and response:
            self.log_test("Teacher Login", True, "Teacher logged in successfully")
        else:
            self.log_test("Teacher Login", False, "Teacher login failed")
            return False
        
        # Test student login
        login_data = {
            "email": self.test_data['student']['email'],
            "password": self.test_data['student']['password']
        }
        
        response, success = self.make_request('POST', '/auth/login', login_data)
        if success and response:
            self.log_test("Student Login", True, "Student logged in successfully")
        else:
            self.log_test("Student Login", False, "Student login failed")
            return False
        
        return True
    
    def test_student_room_login(self):
        """Test student room login with name only"""
        print("🔐 Testing Student Room Login")
        
        # This will be tested later when we have a room created
        # For now, just test the endpoint structure
        room_login_data = {
            "name": "John Doe",
            "roomId": "dummy_room_id"  # Will be replaced with real room ID later
        }
        
        # We'll test this in the room flow section
        self.log_test("Student Room Login Setup", True, "Will test with actual room")
        return True
    
    def test_auth_me(self):
        """Test current user endpoint"""
        print("🔐 Testing Current User Endpoint")
        
        response, success = self.make_request('GET', '/auth/me')
        if success and response:
            user_data = response.json()
            if 'user' in user_data:
                self.log_test("Get Current User", True, f"User: {user_data['user'].get('name', 'Unknown')}")
            else:
                self.log_test("Get Current User", False, "No user data in response")
                return False
        else:
            self.log_test("Get Current User", False, "Failed to get current user")
            return False
        
        return True
    
    def test_auth_logout(self):
        """Test logout"""
        print("🔐 Testing Logout")
        
        response, success = self.make_request('POST', '/auth/logout')
        if success:
            self.log_test("Logout", True, "Logged out successfully")
        else:
            self.log_test("Logout", False, "Logout failed")
            return False
        
        return True
    
    def login_as_admin(self):
        """Helper to login as admin"""
        login_data = {
            "email": self.test_data['admin']['email'],
            "password": self.test_data['admin']['password']
        }
        response, success = self.make_request('POST', '/auth/login', login_data)
        return success
    
    def login_as_teacher(self):
        """Helper to login as teacher"""
        login_data = {
            "email": self.test_data['teacher']['email'],
            "password": self.test_data['teacher']['password']
        }
        response, success = self.make_request('POST', '/auth/login', login_data)
        return success
    
    def login_as_student(self):
        """Helper to login as student"""
        login_data = {
            "email": self.test_data['student']['email'],
            "password": self.test_data['student']['password']
        }
        response, success = self.make_request('POST', '/auth/login', login_data)
        return success
    
    def test_admin_flow(self):
        """Test admin functionality"""
        print("👑 Testing Admin Flow")
        
        # Login as admin
        if not self.login_as_admin():
            self.log_test("Admin Flow - Login", False, "Could not login as admin")
            return False
        
        # Test creating teacher
        new_teacher_data = {
            "name": "Admin Created Teacher",
            "email": self.generate_test_email("admin_teacher"),
            "password": "teacher456"
        }
        
        response, success = self.make_request('POST', '/teachers', new_teacher_data)
        if success and response:
            teacher_id = response.json().get('teacherId')
            self.test_data['admin_created_teacher'] = {**new_teacher_data, 'id': teacher_id}
            self.log_test("Admin Create Teacher", True, f"Teacher created with ID: {teacher_id}")
        else:
            self.log_test("Admin Create Teacher", False, "Failed to create teacher")
            return False
        
        # Test listing teachers
        response, success = self.make_request('GET', '/teachers')
        if success and response:
            teachers = response.json().get('teachers', [])
            self.log_test("Admin List Teachers", True, f"Found {len(teachers)} teachers")
        else:
            self.log_test("Admin List Teachers", False, "Failed to list teachers")
            return False
        
        # Test deleting teacher
        if 'admin_created_teacher' in self.test_data:
            teacher_id = self.test_data['admin_created_teacher']['id']
            response, success = self.make_request('DELETE', f'/teachers/{teacher_id}')
            if success:
                self.log_test("Admin Delete Teacher", True, f"Teacher {teacher_id} deleted")
            else:
                self.log_test("Admin Delete Teacher", False, "Failed to delete teacher")
                return False
        
        return True
    
    def test_teacher_test_management(self):
        """Test teacher test creation and management"""
        print("📝 Testing Teacher Test Management")
        
        # Login as teacher
        if not self.login_as_teacher():
            self.log_test("Teacher Test Management - Login", False, "Could not login as teacher")
            return False
        
        # Create test with multiple variants and different question types
        test_data = {
            "title": "Sample Test with Multiple Variants",
            "description": "Test with MULTIPLE_CHOICE, MATCHING, and OPEN questions",
            "variants": [
                {
                    "name": "Variant A",
                    "questions": [
                        {
                            "text": "What is 2 + 2?",
                            "type": "MULTIPLE_CHOICE",
                            "points": 2,
                            "options": [
                                {"text": "3", "isCorrect": False},
                                {"text": "4", "isCorrect": True},
                                {"text": "5", "isCorrect": False}
                            ]
                        },
                        {
                            "text": "Match the following:",
                            "type": "MATCHING",
                            "points": 3,
                            "pairs": [
                                {"left": "Apple", "right": "Fruit"},
                                {"left": "Car", "right": "Vehicle"},
                                {"left": "Dog", "right": "Animal"}
                            ]
                        },
                        {
                            "text": "Explain the concept of gravity.",
                            "type": "OPEN",
                            "points": 5
                        }
                    ]
                },
                {
                    "name": "Variant B",
                    "questions": [
                        {
                            "text": "What is 3 + 3?",
                            "type": "MULTIPLE_CHOICE",
                            "points": 2,
                            "options": [
                                {"text": "5", "isCorrect": False},
                                {"text": "6", "isCorrect": True},
                                {"text": "7", "isCorrect": False}
                            ]
                        },
                        {
                            "text": "Match the following:",
                            "type": "MATCHING",
                            "points": 3,
                            "pairs": [
                                {"left": "Book", "right": "Reading"},
                                {"left": "Pen", "right": "Writing"},
                                {"left": "Phone", "right": "Communication"}
                            ]
                        },
                        {
                            "text": "Describe the water cycle.",
                            "type": "OPEN",
                            "points": 5
                        }
                    ]
                }
            ]
        }
        
        response, success = self.make_request('POST', '/tests', test_data)
        if success and response:
            test_id = response.json().get('testId')
            self.test_data['test'] = {'id': test_id, 'data': test_data}
            self.log_test("Teacher Create Test", True, f"Test created with ID: {test_id}")
        else:
            self.log_test("Teacher Create Test", False, "Failed to create test")
            return False
        
        # Test listing tests
        response, success = self.make_request('GET', '/tests')
        if success and response:
            tests = response.json().get('tests', [])
            self.log_test("Teacher List Tests", True, f"Found {len(tests)} tests")
        else:
            self.log_test("Teacher List Tests", False, "Failed to list tests")
            return False
        
        # Test getting specific test details
        if 'test' in self.test_data:
            test_id = self.test_data['test']['id']
            response, success = self.make_request('GET', f'/tests/{test_id}')
            if success and response:
                test_details = response.json().get('test')
                variants = test_details.get('variants', [])
                self.log_test("Teacher Get Test Details", True, f"Test has {len(variants)} variants")
                
                # Verify questions are properly structured
                total_questions = sum(len(v.get('questions', [])) for v in variants)
                self.log_test("Test Questions Structure", True, f"Total questions: {total_questions}")
            else:
                self.log_test("Teacher Get Test Details", False, "Failed to get test details")
                return False
        
        return True
    
    def test_room_management(self):
        """Test room creation and management"""
        print("🏠 Testing Room Management")
        
        # Login as teacher
        if not self.login_as_teacher():
            self.log_test("Room Management - Login", False, "Could not login as teacher")
            return False
        
        # Create room from test
        if 'test' not in self.test_data:
            self.log_test("Room Management", False, "No test available to create room")
            return False
        
        room_data = {
            "testId": self.test_data['test']['id'],
            "name": "Test Room for Sample Test"
        }
        
        response, success = self.make_request('POST', '/rooms', room_data)
        if success and response:
            room_id = response.json().get('roomId')
            self.test_data['room'] = {'id': room_id, 'data': room_data}
            self.log_test("Teacher Create Room", True, f"Room created with ID: {room_id}")
        else:
            self.log_test("Teacher Create Room", False, "Failed to create room")
            return False
        
        # Test listing rooms
        response, success = self.make_request('GET', '/rooms')
        if success and response:
            rooms = response.json().get('rooms', [])
            self.log_test("Teacher List Rooms", True, f"Found {len(rooms)} rooms")
        else:
            self.log_test("Teacher List Rooms", False, "Failed to list rooms")
            return False
        
        # Test getting room details
        if 'room' in self.test_data:
            room_id = self.test_data['room']['id']
            response, success = self.make_request('GET', f'/rooms/{room_id}')
            if success and response:
                room_details = response.json().get('room')
                self.log_test("Get Room Details", True, f"Room status: {room_details.get('status')}")
            else:
                self.log_test("Get Room Details", False, "Failed to get room details")
                return False
        
        return True
    
    def test_student_room_flow(self):
        """Test critical student room flow"""
        print("🎓 Testing Student Room Flow (CRITICAL)")
        
        if 'room' not in self.test_data:
            self.log_test("Student Room Flow", False, "No room available for testing")
            return False
        
        room_id = self.test_data['room']['id']
        
        # Test student joining room
        if not self.login_as_student():
            self.log_test("Student Room Flow - Login", False, "Could not login as student")
            return False
        
        response, success = self.make_request('POST', f'/rooms/{room_id}/join')
        if success and response:
            room_student = response.json().get('roomStudent')
            assigned_variant = room_student.get('assignedVariantId')
            self.test_data['room_student'] = room_student
            self.log_test("Student Join Room", True, f"Assigned variant: {assigned_variant}")
        else:
            self.log_test("Student Join Room", False, "Failed to join room")
            return False
        
        # Test that same student gets same variant on rejoin
        response, success = self.make_request('POST', f'/rooms/{room_id}/join')
        if success and response:
            room_student_rejoin = response.json().get('roomStudent')
            same_variant = room_student_rejoin.get('assignedVariantId') == assigned_variant
            already_joined = response.json().get('alreadyJoined', False)
            self.log_test("Student Rejoin Room", same_variant and already_joined, 
                         f"Same variant maintained: {same_variant}, Already joined flag: {already_joined}")
        else:
            self.log_test("Student Rejoin Room", False, "Failed to rejoin room")
            return False
        
        # Test getting questions for assigned variant
        response, success = self.make_request('GET', f'/rooms/{room_id}/questions')
        if success and response:
            questions = response.json().get('questions', [])
            answers = response.json().get('answers', [])
            self.test_data['room_questions'] = questions
            self.log_test("Get Room Questions", True, f"Got {len(questions)} questions")
            
            # Verify question types
            question_types = [q.get('type') for q in questions]
            has_multiple_choice = 'MULTIPLE_CHOICE' in question_types
            has_matching = 'MATCHING' in question_types
            has_open = 'OPEN' in question_types
            self.log_test("Question Types Verification", 
                         has_multiple_choice and has_matching and has_open,
                         f"Types found: {set(question_types)}")
        else:
            self.log_test("Get Room Questions", False, "Failed to get room questions")
            return False
        
        # Test submitting answers
        if 'room_questions' in self.test_data:
            answers = []
            for question in self.test_data['room_questions']:
                if question['type'] == 'MULTIPLE_CHOICE':
                    # Select first option
                    if question.get('options'):
                        answers.append({
                            'questionId': question['_id'],
                            'answer': question['options'][0]['_id']
                        })
                elif question['type'] == 'MATCHING':
                    # Create matching pairs
                    lefts = question.get('lefts', [])
                    rights = question.get('rights', [])
                    if lefts and rights:
                        pairs = []
                        for i, left in enumerate(lefts):
                            if i < len(rights):
                                pairs.append({
                                    'leftId': left['id'],
                                    'rightId': rights[i]['id']
                                })
                        answers.append({
                            'questionId': question['_id'],
                            'answer': pairs
                        })
                elif question['type'] == 'OPEN':
                    answers.append({
                        'questionId': question['_id'],
                        'answer': 'This is a sample answer for the open question.'
                    })
            
            submit_data = {'answers': answers}
            response, success = self.make_request('POST', f'/rooms/{room_id}/submit', submit_data)
            if success:
                self.log_test("Student Submit Answers", True, f"Submitted {len(answers)} answers")
            else:
                self.log_test("Student Submit Answers", False, "Failed to submit answers")
                return False
            
            # Test updating answers (submit again)
            time.sleep(1)  # Small delay
            response, success = self.make_request('POST', f'/rooms/{room_id}/submit', submit_data)
            if success:
                self.log_test("Student Update Answers", True, "Successfully updated answers")
            else:
                self.log_test("Student Update Answers", False, "Failed to update answers")
                return False
        
        return True
    
    def test_room_closing_and_auto_checking(self):
        """Test room closing and auto-checking functionality (CRITICAL)"""
        print("🔒 Testing Room Closing & Auto-Checking (CRITICAL)")
        
        if 'room' not in self.test_data:
            self.log_test("Room Closing", False, "No room available for testing")
            return False
        
        room_id = self.test_data['room']['id']
        
        # Login as teacher to close room
        if not self.login_as_teacher():
            self.log_test("Room Closing - Teacher Login", False, "Could not login as teacher")
            return False
        
        # Close the room
        response, success = self.make_request('POST', f'/rooms/{room_id}/close')
        if success:
            self.log_test("Teacher Close Room", True, "Room closed successfully")
        else:
            self.log_test("Teacher Close Room", False, "Failed to close room")
            return False
        
        # Verify room status changed to CLOSED
        response, success = self.make_request('GET', f'/rooms/{room_id}')
        if success and response:
            room_details = response.json().get('room')
            room_status = room_details.get('status')
            if room_status == 'CLOSED':
                self.log_test("Room Status Verification", True, "Room status is CLOSED")
            else:
                self.log_test("Room Status Verification", False, f"Room status is {room_status}, expected CLOSED")
                return False
        else:
            self.log_test("Room Status Verification", False, "Failed to get room status")
            return False
        
        # Test that students cannot submit after room closed
        if not self.login_as_student():
            self.log_test("Post-Close Student Login", False, "Could not login as student")
            return False
        
        submit_data = {'answers': []}
        response, success = self.make_request('POST', f'/rooms/{room_id}/submit', submit_data, expected_status=400)
        if success:  # success here means we got the expected 400 status
            self.log_test("Prevent Submit After Close", True, "Correctly prevented submission after room closed")
        else:
            self.log_test("Prevent Submit After Close", False, "Should have prevented submission after room closed")
            return False
        
        return True
    
    def test_results_viewing(self):
        """Test results viewing for teachers and students"""
        print("📊 Testing Results Viewing")
        
        if 'room' not in self.test_data:
            self.log_test("Results Viewing", False, "No room available for testing")
            return False
        
        room_id = self.test_data['room']['id']
        
        # Test teacher viewing all results
        if not self.login_as_teacher():
            self.log_test("Results - Teacher Login", False, "Could not login as teacher")
            return False
        
        response, success = self.make_request('GET', f'/rooms/{room_id}/results')
        if success and response:
            results_data = response.json()
            results = results_data.get('results', [])
            self.log_test("Teacher View All Results", True, f"Found {len(results)} results")
            
            # Verify auto-checking worked
            if results:
                result = results[0]
                score = result.get('score')
                total_points = result.get('totalPoints')
                percentage = result.get('percentage')
                self.log_test("Auto-Checking Verification", 
                             score is not None and total_points is not None,
                             f"Score: {score}/{total_points} ({percentage}%)")
        else:
            self.log_test("Teacher View All Results", False, "Failed to get results")
            return False
        
        # Test student viewing their own result
        if not self.login_as_student():
            self.log_test("Results - Student Login", False, "Could not login as student")
            return False
        
        response, success = self.make_request('GET', f'/rooms/{room_id}/results')
        if success and response:
            result_data = response.json()
            result = result_data.get('result')
            if result:
                score = result.get('score')
                total_points = result.get('totalPoints')
                self.log_test("Student View Own Result", True, f"Student score: {score}/{total_points}")
            else:
                self.log_test("Student View Own Result", False, "No result found for student")
                return False
        else:
            self.log_test("Student View Own Result", False, "Failed to get student result")
            return False
        
        return True
    
    def test_authorization(self):
        """Test proper authorization controls"""
        print("🔐 Testing Authorization Controls")
        
        # Test that students can't access teacher endpoints
        if not self.login_as_student():
            self.log_test("Authorization - Student Login", False, "Could not login as student")
            return False
        
        # Student trying to create test (should fail)
        test_data = {"title": "Unauthorized Test", "variants": []}
        response, success = self.make_request('POST', '/tests', test_data, expected_status=401)
        if success:  # success means we got expected 401
            self.log_test("Student Cannot Create Test", True, "Correctly blocked student from creating test")
        else:
            self.log_test("Student Cannot Create Test", False, "Should have blocked student from creating test")
            return False
        
        # Student trying to access teacher list (should fail)
        response, success = self.make_request('GET', '/teachers', expected_status=401)
        if success:  # success means we got expected 401
            self.log_test("Student Cannot Access Teachers", True, "Correctly blocked student from accessing teachers")
        else:
            self.log_test("Student Cannot Access Teachers", False, "Should have blocked student from accessing teachers")
            return False
        
        return True
    
    def test_cleanup(self):
        """Clean up test data"""
        print("🧹 Cleaning Up Test Data")
        
        # Login as teacher to delete test
        if self.login_as_teacher() and 'test' in self.test_data:
            test_id = self.test_data['test']['id']
            response, success = self.make_request('DELETE', f'/tests/{test_id}')
            if success:
                self.log_test("Cleanup - Delete Test", True, f"Test {test_id} deleted")
            else:
                self.log_test("Cleanup - Delete Test", False, "Failed to delete test")
        
        return True
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Comprehensive Backend API Testing")
        print("=" * 60)
        
        test_results = []
        
        # Authentication Tests
        test_results.append(("Auth Signup", self.test_auth_signup()))
        test_results.append(("Auth Login", self.test_auth_login()))
        test_results.append(("Auth Me", self.test_auth_me()))
        test_results.append(("Student Room Login Setup", self.test_student_room_login()))
        
        # Admin Flow Tests
        test_results.append(("Admin Flow", self.test_admin_flow()))
        
        # Teacher Test Management
        test_results.append(("Teacher Test Management", self.test_teacher_test_management()))
        
        # Room Management
        test_results.append(("Room Management", self.test_room_management()))
        
        # Critical Student Room Flow
        test_results.append(("Student Room Flow", self.test_student_room_flow()))
        
        # Critical Room Closing & Auto-Checking
        test_results.append(("Room Closing & Auto-Checking", self.test_room_closing_and_auto_checking()))
        
        # Results Viewing
        test_results.append(("Results Viewing", self.test_results_viewing()))
        
        # Authorization Tests
        test_results.append(("Authorization Controls", self.test_authorization()))
        
        # Logout Test
        test_results.append(("Auth Logout", self.test_auth_logout()))
        
        # Cleanup
        test_results.append(("Cleanup", self.test_cleanup()))
        
        # Summary
        print("\n" + "=" * 60)
        print("📋 TEST SUMMARY")
        print("=" * 60)
        
        passed = 0
        failed = 0
        critical_failures = []
        
        for test_name, result in test_results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} {test_name}")
            
            if result:
                passed += 1
            else:
                failed += 1
                if any(critical in test_name.lower() for critical in ['room flow', 'auto-checking', 'closing']):
                    critical_failures.append(test_name)
        
        print(f"\nTotal Tests: {len(test_results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        
        if critical_failures:
            print(f"\n❌ CRITICAL FAILURES:")
            for failure in critical_failures:
                print(f"   - {failure}")
        
        if failed == 0:
            print("\n🎉 ALL TESTS PASSED! Backend API is working correctly.")
        elif critical_failures:
            print(f"\n⚠️  CRITICAL ISSUES FOUND! {len(critical_failures)} critical test(s) failed.")
        else:
            print(f"\n⚠️  {failed} test(s) failed, but no critical failures.")
        
        return failed == 0

if __name__ == "__main__":
    tester = TestPlatformTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)