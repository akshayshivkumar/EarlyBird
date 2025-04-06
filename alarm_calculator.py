#!/usr/bin/env python3
import datetime

def calculate_wake_up(desired_wake_time):
    now = datetime.datetime.now()
    fall_asleep_time = now + datetime.timedelta(minutes=14)
    remaining_minutes = (desired_wake_time - fall_asleep_time).total_seconds() / 60
    cycles = int(remaining_minutes // 90)
    if cycles < 1:
        cycles = 0
        predicted_time = desired_wake_time
    else:
        predicted_time = fall_asleep_time + datetime.timedelta(minutes=cycles * 90)
    return predicted_time, cycles

if __name__ == '__main__':
    desired_wake_time = datetime.datetime.now() + datetime.timedelta(hours=7)
    predicted, cycles = calculate_wake_up(desired_wake_time)
    print("Desired Wake-Up Time:", desired_wake_time.strftime("%I:%M %p"))
    print("Predicted Optimal Wake-Up Time:", predicted.strftime("%I:%M %p"))
    print("Feasible Sleep Cycles:", cycles)
