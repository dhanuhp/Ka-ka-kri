from django.conf import settings
from django.db import models


class Question(models.Model):
    TYPES = [('coding', 'Coding'), ('conceptual', 'Conceptual'), ('behavioral', 'Behavioral')]
    TOPICS = [('Algorithms', 'Algorithms'), ('Data Structures', 'Data Structures'),
              ('Databases', 'Databases'), ('System Design', 'System Design'),
              ('Behavioral', 'Behavioral'), ('Web Development', 'Web Development')]

    kind = models.CharField(max_length=20, choices=TYPES)
    topic = models.CharField(max_length=30, choices=TOPICS)
    prompt = models.TextField()
    context = models.TextField(blank=True)
    answer_key = models.TextField()
    keywords = models.TextField(blank=True)
    options = models.JSONField(default=list, blank=True)
    difficulty = models.IntegerField(default=2)
    time_limit = models.IntegerField(default=15)

    def __str__(self):
        return f'{self.topic}: {self.prompt[:55]}'


class Interview(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=120)
    mode = models.CharField(max_length=30, default='Full interview')
    status = models.CharField(max_length=20, default='active')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    hosted_session = models.ForeignKey('HostedInterview', null=True, blank=True, on_delete=models.SET_NULL, related_name='attempts')


class HostedInterview(models.Model):
    STATUSES = [('scheduled', 'Scheduled'), ('live', 'Live'), ('completed', 'Completed')]
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='hosted_interviews')
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    level = models.CharField(max_length=20, default='Mixed')
    access_code = models.CharField(max_length=12, unique=True)
    status = models.CharField(max_length=20, choices=STATUSES, default='scheduled')
    scheduled_at = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=45)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.title} ({self.access_code})'


class InterviewParticipation(models.Model):
    session = models.ForeignKey(HostedInterview, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='interview_participations')
    joined_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('session', 'user')


class InterviewQuestion(models.Model):
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']


class Response(models.Model):
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer = models.TextField(blank=True)
    time_seconds = models.PositiveIntegerField(default=0)
    score = models.FloatField(default=0)
    qualitative_feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='interview_profile')
    role = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    target_role = models.CharField(max_length=100, blank=True)
    experience_level = models.CharField(max_length=30, default='Entry')
    avatar = models.ImageField(upload_to='avatars/', blank=True)


class Resume(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resumes')
    file = models.FileField(upload_to='resumes/')
    original_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)


class AnswerEvaluation(models.Model):
    response = models.OneToOneField(Response, on_delete=models.CASCADE, related_name='evaluation')
    correctness = models.FloatField(default=0)
    communication = models.FloatField(default=0)
    completeness = models.FloatField(default=0)
    summary = models.TextField(blank=True)


class CodingSubmission(models.Model):
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='coding_submissions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    language = models.CharField(max_length=30, default='python')
    source_code = models.TextField()
    output = models.TextField(blank=True)
    passed_tests = models.PositiveIntegerField(default=0)
    total_tests = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=30, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)


class InterviewReport(models.Model):
    interview = models.OneToOneField(Interview, on_delete=models.CASCADE, related_name='report')
    overall_score = models.FloatField(default=0)
    strengths = models.TextField(blank=True)
    improvements = models.TextField(blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)


class SkillScore(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='skill_scores')
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE)
    topic = models.CharField(max_length=30)
    score = models.FloatField(default=0)
    updated_at = models.DateTimeField(auto_now=True)


class LearningRoadmap(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='roadmaps')
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class LearningTask(models.Model):
    roadmap = models.ForeignKey(LearningRoadmap, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=160)
    resource_url = models.URLField(blank=True)
    completed = models.BooleanField(default=False)
    due_date = models.DateField(null=True, blank=True)
    position = models.PositiveIntegerField(default=0)


class InterviewHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='interview_history')
    interview = models.OneToOneField(Interview, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


class UserProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress')
    date = models.DateField()
    score = models.FloatField(default=0)
    minutes_practiced = models.PositiveIntegerField(default=0)
