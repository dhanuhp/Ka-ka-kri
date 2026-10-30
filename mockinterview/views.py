from collections import defaultdict
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.db.models import Avg
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST
from .models import (Interview, InterviewQuestion, InterviewReport, Question, Response,
                     UserProfile, Resume, LearningRoadmap, LearningTask, SkillScore, HostedInterview, InterviewParticipation)


def landing(request):
    return render(request, 'mockinterview/landing.html')


def login_view(request):
    if request.user.is_authenticated:
        if request.user.is_staff:
            return redirect('admin_dashboard')
        return redirect('dashboard')
    if request.method == 'POST':
        user = authenticate(request, username=request.POST.get('username', '').strip(),
                            password=request.POST.get('password', ''))
        if user:
            if user.is_staff:
                logout(request)
                messages.error(request, 'Administrator accounts must use the admin login page.')
                return redirect('admin_login')
            login(request, user)
            return redirect(request.GET.get('next', 'dashboard'))
        messages.error(request, 'Invalid username or password.')
    return render(request, 'mockinterview/auth/login.html')


def admin_login(request):
    if request.user.is_authenticated:
        if request.user.is_staff:
            return redirect('admin_dashboard')
        logout(request)
    if request.method == 'POST':
        user = authenticate(request, username=request.POST.get('username', '').strip(),
                            password=request.POST.get('password', ''))
        if user and user.is_staff:
            login(request, user)
            return redirect('admin_dashboard')
        messages.error(request, 'Invalid administrator credentials or account access.')
    return render(request, 'mockinterview/auth/admin_login.html')


def register(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip().lower()
        password = request.POST.get('password', '')
        confirmation = request.POST.get('confirmation', '')
        if not username or not email or len(password) < 8:
            messages.error(request, 'Use a username, valid email, and a password of at least 8 characters.')
        elif password != confirmation:
            messages.error(request, 'Passwords do not match.')
        elif User.objects.filter(username__iexact=username).exists():
            messages.error(request, 'That username is already registered.')
        elif User.objects.filter(email__iexact=email).exists():
            messages.error(request, 'That email is already registered.')
        else:
            try:
                with transaction.atomic():
                    user = User.objects.create_user(username=username, email=email, password=password,
                                                     first_name=request.POST.get('first_name', '').strip(),
                                                     last_name=request.POST.get('last_name', '').strip())
                    UserProfile.objects.create(user=user)
            except IntegrityError:
                messages.error(request, 'That username or email is already registered.')
                return render(request, 'mockinterview/auth/register.html')
            login(request, user)
            return redirect('dashboard')
    return render(request, 'mockinterview/auth/register.html')


@login_required
def logout_view(request):
    logout(request)
    return redirect('landing')


QUESTIONS = [
    {'kind':'mcq','topic':'Algorithms','prompt':'Which data structure gives an average O(1) lookup time?','context':'Select the best answer.','answer_key':'A','keywords':'','options':[{'label':'A','text':'Hash table'},{'label':'B','text':'Linked list'},{'label':'C','text':'Binary search tree'},{'label':'D','text':'Stack'}],'difficulty':1,'time_limit':2},
    {'kind':'reasoning','topic':'Algorithms','prompt':'A sorted array and an unsorted array both contain 1 million numbers. Why might binary search be unsuitable for the second array?','context':'Explain the requirement and the correct alternative.','answer_key':'binary search requires sorted data use linear search','keywords':'sorted,sorting,binary,linear,order','difficulty':2,'time_limit':5},
    {'kind':'mcq','topic':'Data Structures','prompt':'What operation is most efficient in a stack?','context':'Select the best answer.','answer_key':'A','keywords':'','options':[{'label':'A','text':'Push at the top'},{'label':'B','text':'Remove from the middle'},{'label':'C','text':'Search by value'},{'label':'D','text':'Sort in place'}],'difficulty':1,'time_limit':2},
    {'kind':'reasoning','topic':'Data Structures','prompt':'You need frequent insertions in the middle and constant-time access by index. Which structure is preferred, and why?','context':'Compare the trade-offs before giving your answer.','answer_key':'no structure satisfies both choose list or linked list tradeoff','keywords':'trade-off,array,list,linked,index,insert,middle','difficulty':4,'time_limit':7},
    {'kind':'description','topic':'Databases','prompt':'Describe the purpose of an index in a database. Include one benefit and one drawback.','context':'Answer in two or three complete sentences.','answer_key':'index speeds reads uses extra storage slows writes','keywords':'speed,read,query,storage,space,write,insert','difficulty':2,'time_limit':5},
    {'kind':'mcq','topic':'Databases','prompt':'Which SQL command retrieves rows from a table?','context':'Select the best answer.','answer_key':'B','keywords':'','options':[{'label':'A','text':'INSERT'},{'label':'B','text':'SELECT'},{'label':'C','text':'UPDATE'},{'label':'D','text':'DELETE'}],'difficulty':1,'time_limit':2},
    {'kind':'reasoning','topic':'System Design','prompt':'A news feed becomes slow during traffic spikes. Which caching strategy would you use and how would you handle stale data?','context':'Name cache placement, expiration policy, and invalidation.','answer_key':'cache feed TTL invalidation write through cache stampede','keywords':'cache,ttl,expiration,invalidation,write,stale,redis','difficulty':4,'time_limit':8},
    {'kind':'mcq','topic':'System Design','prompt':'Which load-balancing approach distributes requests across multiple servers?','context':'Select the best answer.','answer_key':'C','keywords':'','options':[{'label':'A','text':'Database normalization'},{'label':'B','text':'Client-side caching'},{'label':'C','text':'Round-robin'},{'label':'D','text':'Vertical partitioning'}],'difficulty':2,'time_limit':2},
    {'kind':'description','topic':'Behavioral','prompt':'Describe a situation where you had to explain a technical problem to a non-technical teammate.','context':'Use the situation, action, and result structure.','answer_key':'situation action result explain simple communicate outcome','keywords':'situation,action,result,explained,communicated,listened,outcome','difficulty':2,'time_limit':7},
    {'kind':'mcq','topic':'Web Development','prompt':'Which HTTP status code means a resource was created successfully?','context':'Select the best answer.','answer_key':'B','keywords':'','options':[{'label':'A','text':'200'},{'label':'B','text':'201'},{'label':'C','text':'404'},{'label':'D','text':'500'}],'difficulty':1,'time_limit':2},
    {'kind':'coding','topic':'Algorithms','prompt':'Given an array of integers, return indices of two numbers that add up to a specific target.','context':'Provide your approach and explain its time and space complexity.','answer_key':'hash map one pass O(n) dictionary lookup','keywords':'hash,map,dictionary,O(n),lookup,one pass','difficulty':2,'time_limit':20},
    {'kind':'conceptual','topic':'Data Structures','prompt':'Explain how a hash table handles collisions.','context':'Name at least two collision resolution strategies and one trade-off.','answer_key':'chaining or open addressing, separate chaining, probing','keywords':'collision,chaining,separate chaining,open addressing,probing,load factor','difficulty':2,'time_limit':10},
    {'kind':'coding','topic':'Data Structures','prompt':'Validate balanced parentheses in an expression.','context':'Describe the stack-based algorithm and edge cases.','answer_key':'stack push opening pop closing matching top','keywords':'stack,push,pop,matching,balanced,opening,closing','difficulty':1,'time_limit':15},
    {'kind':'conceptual','topic':'Databases','prompt':'What is database normalization, and why is it useful?','context':'Mention a normal form and the main trade-off.','answer_key':'normalization reduces redundancy improves integrity','keywords':'normalization,redundancy,integrity,duplicate,1NF,2NF,3NF,trade-off','difficulty':2,'time_limit':12},
    {'kind':'coding','topic':'Web Development','prompt':'Implement a function that debounces an event handler.','context':'Explain the role of timers and cancellation.','answer_key':'delay execution reset timer clearTimeout closure','keywords':'timer,timeout,clearTimeout,delay,closure,cancel,debounce','difficulty':3,'time_limit':18},
    {'kind':'behavioral','topic':'Behavioral','prompt':'Tell me about a time you resolved a disagreement with a teammate.','context':'Use a specific example and describe the outcome.','answer_key':'situation task action result listen communicate compromise','keywords':'situation,task,action,result,listened,communication,compromise,collaborated,outcome','difficulty':2,'time_limit':10},
    {'kind':'conceptual','topic':'System Design','prompt':'How would you design a URL-shortening service?','context':'Cover encoding, storage, redirection, and scale.','answer_key':'base62 unique key key-value database cache redirect high availability','keywords':'base62,hash,key-value,database,cache,redirect,scale,unique,availability','difficulty':4,'time_limit':20},
]


def seed_questions():
    for data in QUESTIONS:
        defaults = {key: value for key, value in data.items() if key != 'prompt'}
        Question.objects.update_or_create(prompt=data['prompt'], defaults=defaults)


@login_required
def dashboard(request):
    seed_questions()
    user = request.user
    if user.is_staff:
        return redirect('admin_dashboard')
    interviews = Interview.objects.filter(user=user).order_by('-started_at')
    responses = Response.objects.filter(interview__user=user)
    accuracy = responses.aggregate(value=Avg('score'))['value'] or 0
    completed = interviews.filter(status='completed').count()
    avg_time = responses.aggregate(value=Avg('time_seconds'))['value'] or 0
    hosted = HostedInterview.objects.filter(status__in=['scheduled', 'live']).exclude(
        participants__user=request.user).distinct().order_by('scheduled_at')
    return render(request, 'mockinterview/dashboard.html', {'interviews': interviews[:5], 'accuracy': round(accuracy, 1), 'completed': completed,
                                                            'avg_time': round(avg_time / 60, 1), 'hosted': hosted})


@login_required
def interviews(request):
    if request.user.is_staff:
        return redirect('admin_dashboard')
    seed_questions()
    return render(request, 'mockinterview/interviews.html', {'questions': Question.objects.all(), 'levels':['Basic','Advanced','Mixed']})


@login_required
def start_interview(request):
    seed_questions()
    title = request.POST.get('title', 'Full technical interview') if request.method == 'POST' else 'Full technical interview'
    interview = Interview.objects.create(user=request.user, title=title, mode=request.POST.get('mode', 'Full interview') if request.method == 'POST' else 'Full interview')
    level = request.POST.get('level', 'Mixed')
    questions = Question.objects.all()
    if level == 'Basic':
        questions = questions.filter(difficulty__lte=2)
    elif level == 'Advanced':
        questions = questions.filter(difficulty__gte=3)
    questions = list(questions.order_by('?')[:5])
    for order, question in enumerate(questions):
        InterviewQuestion.objects.create(interview=interview, question=question, order=order)
    return redirect('take_interview', interview_id=interview.id)


@login_required
def take_interview(request, interview_id):
    seed_questions()
    interview = get_object_or_404(Interview, id=interview_id, user=request.user)
    links = InterviewQuestion.objects.filter(interview=interview)
    responses = Response.objects.filter(interview=interview).values_list('question_id', flat=True)
    unanswered = [link for link in links if link.question_id not in responses]
    if not unanswered:
        return redirect('results', interview_id=interview.id)
    active = unanswered[0]
    return render(request, 'mockinterview/interview.html', {'interview': interview, 'link': active, 'question': active.question,
                                                            'number': active.order + 1, 'total': links.count(),
                                                            'answered': len(responses)})


def evaluate(question, answer, seconds):
    text = answer.lower().strip()
    if not text:
        return 0, 'No answer was provided. Try to explain your reasoning before writing the solution.'
    if question.options:
        correct = question.answer_key.strip().lower()
        score = 100 if text == correct else 0
    else:
        terms = [item.strip().lower() for item in question.keywords.split(',') if item.strip()]
        matched = sum(any(term in text for term in [term]) for term in terms)
        coverage = matched / max(len(terms), 1)
        length_bonus = min(len(text.split()) / 25, 0.15)
        score = min(100, (coverage * 85) + length_bonus * 100)
    efficiency = 100 * (1 - max(seconds - question.time_limit * 60, 0) / max(question.time_limit * 60, 1))
    if score >= 80:
        feedback = 'Excellent response. You covered the key ideas clearly and demonstrated sound reasoning.'
    elif score >= 55:
        feedback = 'Good foundation. Add missing technical details and connect your approach to trade-offs or complexity.'
    else:
        feedback = 'Needs improvement. Restate the core concept, build a step-by-step approach, and include a relevant example.'
    if efficiency < 60:
        feedback += ' Your response took longer than the target time; practice under timed conditions.'
    return round(score, 1), feedback


@require_POST
@login_required
def submit_answer(request, interview_id):
    interview = get_object_or_404(Interview, id=interview_id, user=request.user)
    question = get_object_or_404(Question, id=request.POST['question_id'])
    answer = request.POST.get('answer', '')
    seconds = min(int(request.POST.get('time_seconds', 0) or 0), 3600)
    score, feedback = evaluate(question, answer, seconds)
    Response.objects.update_or_create(interview=interview, question=question,
                                      defaults={'answer': answer, 'time_seconds': seconds, 'score': score, 'qualitative_feedback': feedback})
    return redirect('take_interview', interview_id=interview.id)


@login_required
def complete_interview(request, interview_id):
    interview = get_object_or_404(Interview, id=interview_id, user=request.user)
    interview.status = 'completed'
    interview.completed_at = timezone.now()
    interview.save()
    participation = InterviewParticipation.objects.filter(session=interview.hosted_session, user=request.user).first()
    if participation:
        participation.completed_at = timezone.now()
        participation.save()
    responses = Response.objects.filter(interview=interview).select_related('question')
    score = responses.aggregate(value=Avg('score'))['value'] or 0
    strengths = ', '.join(sorted({r.question.topic for r in responses if r.score >= 70})) or 'Progress is beginning to build'
    improvements = ', '.join(sorted({r.question.topic for r in responses if r.score < 70})) or 'Continue regular timed practice'
    InterviewReport.objects.update_or_create(interview=interview,
                                             defaults={'overall_score': round(score, 1), 'strengths': strengths, 'improvements': improvements})
    for topic in {r.question.topic for r in responses}:
        topic_scores = [r.score for r in responses if r.question.topic == topic]
        SkillScore.objects.update_or_create(user=request.user, interview=interview, topic=topic,
                                            defaults={'score': round(sum(topic_scores) / len(topic_scores), 1)})
    return redirect('results', interview_id=interview.id)


@login_required
def results(request, interview_id):
    interview = get_object_or_404(Interview, id=interview_id, user=request.user)
    responses = Response.objects.filter(interview=interview).select_related('question')
    score = responses.aggregate(value=Avg('score'))['value'] or 0
    avg_time = responses.aggregate(value=Avg('time_seconds'))['value'] or 0
    topic_scores = defaultdict(list)
    type_scores = defaultdict(list)
    for response in responses:
        topic_scores[response.question.topic].append(response.score)
        type_scores[response.question.kind].append(response.score)
    topics = [{'topic': topic, 'score': round(sum(values) / len(values), 1)} for topic, values in topic_scores.items()]
    question_types = [{'kind': kind, 'score': round(sum(values) / len(values), 1)} for kind, values in type_scores.items()]
    weakest = min(topics, key=lambda item: item['score']) if topics else None
    return render(request, 'mockinterview/results.html', {'interview': interview, 'responses': responses, 'score': round(score, 1),
                                                          'avg_time': round(avg_time / 60, 1), 'topics': topics,
                                                          'question_types': question_types, 'weakest': weakest})


@login_required
def recommendations(request):
    user = request.user
    responses = Response.objects.filter(interview__user=user).select_related('question')
    topic_scores = defaultdict(list)
    for response in responses:
        topic_scores[response.question.topic].append(response.score)
    mastery = [{'topic': topic, 'score': round(sum(scores) / len(scores), 1)} for topic, scores in topic_scores.items()]
    if mastery:
        weakest = min(mastery, key=lambda item: item['score'])
    else:
        weakest = {'topic': 'Algorithms', 'score': 0}
    plans = {
        'Algorithms': ('7-day algorithm sprint', 'Solve 2 array, 2 string, and 2 tree problems daily; finish with timed mock rounds.', ['/ LeetCode Patterns', 'NeetCode Roadmap']),
        'Data Structures': ('Data structures fundamentals', 'Review stacks, queues, maps, trees, and their amortized operations.', ['VisuAlgo', 'CS50 Data Structures']),
        'Databases': ('Database design week', 'Practice normalization, indexing, transactions, and SQL joins.', ['SQLZoo', 'Mode SQL Tutorial']),
        'System Design': ('System design foundations', 'Study scaling, caching, queues, databases, and write one design each day.', ['System Design Primer', 'ByteByteGo']),
        'Behavioral': ('STAR story workshop', 'Create six STAR stories and rehearse concise leadership and conflict examples.', ['STAR Method Guide', 'Indeed Interview Tips']),
        'Web Development': ('Frontend engineering practice', 'Build small components covering state, async timing, accessibility, and API calls.', ['web.dev Learn', 'MDN JavaScript Guide']),
    }
    plan = plans[weakest['topic']]
    return render(request, 'mockinterview/recommendations.html', {'mastery': mastery, 'weakest': weakest, 'plan': plan})


@login_required
def profile(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    if request.method == 'POST':
        if request.FILES.get('resume'):
            resume = request.FILES['resume']
            if resume.size > 5 * 1024 * 1024 or not resume.name.lower().endswith('.pdf'):
                messages.error(request, 'Resume must be a PDF smaller than 5 MB.')
            else:
                Resume.objects.create(user=request.user, file=resume, original_name=resume.name)
                messages.success(request, 'Profile and resume updated.')
            return redirect('profile')
        request.user.first_name = request.POST.get('first_name', '').strip()
        request.user.last_name = request.POST.get('last_name', '').strip()
        request.user.email = request.POST.get('email', '').strip()
        request.user.save()
        profile.role = request.POST.get('role', '').strip()
        profile.bio = request.POST.get('bio', '').strip()
        profile.target_role = request.POST.get('target_role', '').strip()
        profile.experience_level = request.POST.get('experience_level', profile.experience_level)
        profile.save()
        messages.success(request, 'Profile updated.')
        return redirect('profile')
    return render(request, 'mockinterview/profile.html', {'profile': profile, 'resumes': Resume.objects.filter(user=request.user).order_by('-uploaded_at')[:5]})


@login_required
def analytics(request):
    responses = Response.objects.filter(interview__user=request.user).select_related('question')
    topic_scores = defaultdict(list)
    recent_scores = []
    for response in responses:
        topic_scores[response.question.topic].append(response.score)
        recent_scores.append((response.created_at.strftime('%b %d'), round(response.score, 1)))
    mastery = [{'topic': topic, 'score': round(sum(scores) / len(scores), 1), 'attempts': len(scores)}
               for topic, scores in topic_scores.items()]
    completed = Interview.objects.filter(user=request.user, status='completed').count()
    overall = responses.aggregate(value=Avg('score'))['value'] or 0
    avg_time = responses.aggregate(value=Avg('time_seconds'))['value'] or 0
    return render(request, 'mockinterview/analytics.html', {'mastery': mastery, 'trend': recent_scores[-12:],
                                                            'overall': round(overall, 1), 'completed': completed,
                                                            'avg_time': round(avg_time / 60, 1)})


@login_required
def learning_roadmap(request):
    roadmap = LearningRoadmap.objects.filter(user=request.user).order_by('-created_at').first()
    if not roadmap:
        roadmap = LearningRoadmap.objects.create(user=request.user, title='Personal interview roadmap',
                                                 description='Complete each task to strengthen your weakest interview skills.')
        LearningTask.objects.bulk_create([
            LearningTask(roadmap=roadmap, title='Review data structure fundamentals', position=1),
            LearningTask(roadmap=roadmap, title='Complete 10 timed coding problems', position=2),
            LearningTask(roadmap=roadmap, title='Write six STAR behavioral stories', position=3),
            LearningTask(roadmap=roadmap, title='Complete a system design exercise', position=4),
        ])
    if request.method == 'POST':
        task = get_object_or_404(LearningTask, id=request.POST.get('task_id'), roadmap=roadmap)
        task.completed = not task.completed
        task.save()
        return redirect('learning_roadmap')
    return render(request, 'mockinterview/roadmap.html', {'roadmap': roadmap, 'tasks': roadmap.tasks.order_by('position')})


@login_required
def interview_history(request):
    interviews = Interview.objects.filter(user=request.user).order_by('-started_at')
    return render(request, 'mockinterview/history.html', {'interviews': interviews})


@login_required
def settings_view(request):
    if request.method == 'POST':
        if request.POST.get('action') == 'password':
            if request.user.check_password(request.POST.get('current_password', '')):
                password = request.POST.get('new_password', '')
                if len(password) >= 8:
                    request.user.set_password(password)
                    request.user.save()
                    login(request, request.user)
                    messages.success(request, 'Password changed successfully.')
                else:
                    messages.error(request, 'New password must contain at least 8 characters.')
            else:
                messages.error(request, 'Current password is incorrect.')
        else:
            messages.success(request, 'Notification preferences saved.')
        return redirect('settings')
    return render(request, 'mockinterview/settings.html')


@login_required
@user_passes_test(lambda user: user.is_staff)
def admin_dashboard(request):
    users = User.objects.order_by('-date_joined')
    interviews = Interview.objects.select_related('user').order_by('-started_at')
    reports = []
    for session in HostedInterview.objects.select_related('host').order_by('-created_at')[:20]:
        participants = []
        for participation in session.participants.select_related('user'):
            attempt = Interview.objects.filter(user=participation.user, hosted_session=session).first()
            responses = Response.objects.filter(interview=attempt).select_related('question') if attempt else []
            overall = responses.aggregate(value=Avg('score'))['value'] if responses else 0
            topic_scores = defaultdict(list)
            for response in responses:
                topic_scores[response.question.topic].append(response.score)
            strengths = ', '.join(sorted(topic for topic, values in topic_scores.items()
                                         if sum(values) / len(values) >= 70)) or 'Not enough evidence'
            weaknesses = ', '.join(sorted(topic for topic, values in topic_scores.items()
                                          if sum(values) / len(values) < 70)) or 'No major weakness identified'
            participants.append({'user': participation.user, 'attempt': attempt, 'score': round(overall or 0, 1),
                                 'strengths': strengths, 'weaknesses': weaknesses,
                                 'completed': participation.completed_at is not None})
        participants.sort(key=lambda participant: participant['score'], reverse=True)
        reports.append({'session': session, 'participants': participants})
    return render(request, 'mockinterview/admin.html', {'users': users[:20], 'interviews': interviews[:20],
                                                        'user_count': users.count(), 'interview_count': interviews.count(),
                                                        'reports': reports})


@login_required
@user_passes_test(lambda user: user.is_staff)
def candidate_selection(request):
    from django.db.models import Avg, Count

    candidates = []
    users = User.objects.filter(interview__isnull=False).distinct()
    for user in users:
        responses = Response.objects.filter(interview__user=user)
        completed = Interview.objects.filter(user=user, status='completed')
        if not responses.exists():
            continue
        overall = responses.aggregate(score=Avg('score'))['score'] or 0
        average_time = responses.aggregate(seconds=Avg('time_seconds'))['seconds'] or 0
        coding_responses = responses.filter(question__kind='coding')
        mcq_responses = responses.filter(question__kind='mcq')
        reasoning_responses = responses.filter(question__kind='reasoning')
        skills = [
            {'name': kind.title(), 'score': round(values.aggregate(score=Avg('score'))['score'] or 0, 1)}
            for kind, values in [('Coding', coding_responses), ('MCQ', mcq_responses),
                                 ('Reasoning', reasoning_responses)]
            if values.exists()
        ]
        speed_score = 100
        if average_time:
            speed_score = max(0, 100 - max(average_time / 60 - 5, 0) * 5)
        interview_score = round(overall * 0.75 + speed_score * 0.25, 1)
        topic_scores = defaultdict(list)
        for response in responses:
            topic_scores[response.question.topic].append(response.score)
        strengths = sorted(
            [{'topic': topic, 'score': round(sum(values) / len(values), 1)}
             for topic, values in topic_scores.items() if sum(values) / len(values) >= 70],
            key=lambda item: item['score'], reverse=True)
        weaknesses = sorted(
            [{'topic': topic, 'score': round(sum(values) / len(values), 1)}
             for topic, values in topic_scores.items() if sum(values) / len(values) < 70],
            key=lambda item: item['score'])
        candidates.append({
            'user': user,
            'profile': getattr(user, 'interview_profile', None),
            'overall': round(overall, 1),
            'interviews': completed.count(),
            'speed_score': round(speed_score, 1),
            'interview_score': interview_score,
            'skills': skills,
            'strengths': strengths,
            'weaknesses': weaknesses,
        })
    candidates.sort(key=lambda candidate: candidate['interview_score'], reverse=True)
    for rank, candidate in enumerate(candidates, start=1):
        candidate['rank'] = rank
    return render(request, 'mockinterview/candidate_selection.html', {'candidates': candidates})


@login_required
@user_passes_test(lambda user: user.is_staff)
def hosted_interviews(request):
    if request.method == 'POST':
        import secrets
        from django.utils.dateparse import parse_datetime
        scheduled_at = parse_datetime(request.POST.get('scheduled_at', ''))
        if scheduled_at is not None and timezone.is_naive(scheduled_at):
            scheduled_at = timezone.make_aware(scheduled_at)
        if not scheduled_at:
            messages.error(request, 'Choose a valid interview date and time.')
        else:
            session = HostedInterview.objects.create(
                host=request.user, title=request.POST.get('title', '').strip(),
                description=request.POST.get('description', '').strip(),
                level=request.POST.get('level', 'Mixed'), scheduled_at=scheduled_at,
                duration_minutes=int(request.POST.get('duration_minutes', 45)),
                access_code=secrets.token_urlsafe(6).upper().replace('-', '').replace('_', '')[:8],
                status='live' if timezone.now() >= scheduled_at else 'scheduled')
            messages.success(request, f'Interview room published. Access code: {session.access_code}')
            return redirect('hosted_interviews')
    sessions = HostedInterview.objects.filter(host=request.user).order_by('-created_at')
    return render(request, 'mockinterview/hosted_interviews.html', {'sessions': sessions})


@login_required
def join_hosted_interview(request, session_id):
    session = get_object_or_404(HostedInterview, id=session_id)
    participation, _ = InterviewParticipation.objects.get_or_create(session=session, user=request.user)
    existing = Interview.objects.filter(user=request.user, hosted_session=session).first()
    if not existing:
        existing = Interview.objects.create(user=request.user, title=session.title, mode=f'Hosted {session.level}',
                                            hosted_session=session)
        questions = list(Question.objects.filter(difficulty__lte=2).order_by('?')[:5] if session.level == 'Basic'
                          else Question.objects.filter(difficulty__gte=3).order_by('?')[:5] if session.level == 'Advanced'
                          else Question.objects.order_by('?')[:5])
        for order, question in enumerate(questions):
            InterviewQuestion.objects.create(interview=existing, question=question, order=order)
        participation.started_at = timezone.now()
        participation.save()
    return redirect('take_interview', interview_id=existing.id)
