from django.shortcuts import render

import random
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import *

MIN_NUMBER = 3
MAX_NUMBER = 9
TOTAL_NUMBERS = 4
TARGET = [30, 40, 50, 60, 70, 80, 90, 100, 110, 120]

@csrf_exempt
def start_game(request):
    if request.method != 'GET':
        return JsonResponse ({'error': 'GET only'}, status=405)
    
    rand_target = random.choice(TARGET)

    # rand_number = [
    #     random.randint(MIN_NUMBER, MAX_NUMBER)
    #     for i in range(TOTAL_NUMBERS)
    # ]

    rand_number = random.sample(range(MIN_NUMBER, MAX_NUMBER + 1), TOTAL_NUMBERS)

    return JsonResponse({
        "target": rand_target,
        "numbers": rand_number
    })


@csrf_exempt
def submit_result(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST only'}, status=405)
    data = json.loads(request.body)
    score.objects.create(
        team_name=data.get('team_name'),
        score=data.get('score')
    )
    return JsonResponse({'message': 'Success'}, status=200)

@csrf_exempt
def get_leaderboard(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'GET only'}, status=405)
    top_10_score = score.objects.all().order_by('-score')[:10].values('team_name', 'score', 'created_at')
    return JsonResponse(list(top_10_score), safe=False, status=200)


@csrf_exempt
def reset_leaderboard(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST only'}, status=405)
    
    # Menghapus SEMUA data di tabel score
    score.objects.all().delete()
    
    return JsonResponse({'message': 'Leaderboard reset success'}, status=200)
