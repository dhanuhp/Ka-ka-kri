from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('', views.landing, name='landing'),
    path('login/', views.login_view, name='login'),
    path('admin-login/', views.admin_login, name='admin_login'),
    path('register/', views.register, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('forgot-password/', auth_views.PasswordResetView.as_view(template_name='mockinterview/auth/password_reset.html'), name='password_reset'),
    path('forgot-password/done/', auth_views.PasswordResetDoneView.as_view(template_name='mockinterview/auth/password_reset_done.html'), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name='mockinterview/auth/password_reset_confirm.html'), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(template_name='mockinterview/auth/password_reset_complete.html'), name='password_reset_complete'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('profile/', views.profile, name='profile'),
    path('analytics/', views.analytics, name='analytics'),
    path('roadmap/', views.learning_roadmap, name='learning_roadmap'),
    path('history/', views.interview_history, name='interview_history'),
    path('settings/', views.settings_view, name='settings'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('candidate-selection/', views.candidate_selection, name='candidate_selection'),
    path('hosted-interviews/', views.hosted_interviews, name='hosted_interviews'),
    path('hosted-interviews/<int:session_id>/join/', views.join_hosted_interview, name='join_hosted_interview'),
    path('interviews/', views.interviews, name='interviews'),
    path('interviews/start/', views.start_interview, name='start_interview'),
    path('interviews/<int:interview_id>/', views.take_interview, name='take_interview'),
    path('interviews/<int:interview_id>/submit/', views.submit_answer, name='submit_answer'),
    path('interviews/<int:interview_id>/complete/', views.complete_interview, name='complete_interview'),
    path('results/<int:interview_id>/', views.results, name='results'),
    path('recommendations/', views.recommendations, name='recommendations'),
]
