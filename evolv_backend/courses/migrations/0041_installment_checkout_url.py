from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0040_installment_payment_and_suspended'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='authorization_url',
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name='installmentpayment',
            name='authorization_url',
            field=models.URLField(blank=True),
        ),
    ]
