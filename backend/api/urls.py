from django.urls import path
from .views import (
    ItemListCreate, ItemDetail, 
    RepairListCreate, RepairDetail, 
    DamagedItemListCreate, 
    DashboardStats, SaleListCreate, SaleDetail,
    AddRepairPart 
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # --- Inventory ---
    path('items/', ItemListCreate.as_view()),
    path('items/<int:pk>/', ItemDetail.as_view()),
    
    # --- Repairs ---
    path('repairs/', RepairListCreate.as_view()),
    path('repairs/<int:pk>/', RepairDetail.as_view()),
    path('repairs/parts/', AddRepairPart.as_view()), 
    
    # --- Sales & Returns ---
    path('sales/', SaleListCreate.as_view()),
    path('sales/<int:pk>/', SaleDetail.as_view()),
    path('damaged/', DamagedItemListCreate.as_view()), 
    
    # --- Analytics ---
    path('dashboard/', DashboardStats.as_view()),

    # --- Authentication (JWT) ---
    path('token/', TokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
]