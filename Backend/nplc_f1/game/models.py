from django.db import models

# Create your models here.

class score(models.Model):
    team_name = models.CharField(max_length=20)
    score = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.team_name} - {self.score}"