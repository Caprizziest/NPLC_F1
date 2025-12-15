from django.shortcuts import render

import random
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


MIN_NUMBER = 3
MAX_NUMBER = 9
TOTAL_NUMBERS = 4
TARGET = [30, 40, 50, 60, 70, 80, 90, 100, 110, 120]

@csrf_exempt
def start_game(request):
    if request.method != 'GET':
        return JsonResponse ({'error': 'GET only'}, status=405)
    
    rand_target = random.choice(TARGET)

    rand_number = [
        random.randint(MIN_NUMBER, MAX_NUMBER)
        for _ in range(TOTAL_NUMBERS)
    ]

    return JsonResponse({
        "target": rand_target,
        "numbers": rand_number
    })
