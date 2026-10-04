import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const datetimePicker = document.querySelector('#datetime-picker');
const startBtn = document.querySelector('[data-start]');
const daysEl = document.querySelector('[data-days]');
const hoursEl = document.querySelector('[data-hours]');
const minutesEl = document.querySelector('[data-minutes]');
const secondsEl = document.querySelector('[data-seconds]');

let userSelectedDate = null;
let intervalId = null;

function convertMs(ms) {
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const days = Math.floor(ms / day);
  const hours = Math.floor((ms % day) / hour);
  const minutes = Math.floor(((ms % day) % hour) / minute);
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}

function addLeadingZero(value) {
  return String(value).padStart(2, '0');
}

function updateTimerDisplay({ days, hours, minutes, seconds }) {
  daysEl.textContent = String(days);
  hoursEl.textContent = addLeadingZero(hours);
  minutesEl.textContent = addLeadingZero(minutes);
  secondsEl.textContent = addLeadingZero(seconds);
}

function showZeroTimer() {
  daysEl.textContent = '00';
  hoursEl.textContent = '00';
  minutesEl.textContent = '00';
  secondsEl.textContent = '00';
}

function setStartEnabled(enabled) {
  startBtn.disabled = !enabled;
}

function validateSelectedDate(selectedDate) {
  if (!selectedDate) {
    userSelectedDate = null;
    setStartEnabled(false);
    return;
  }

  if (selectedDate.getTime() <= Date.now()) {
    userSelectedDate = null;
    setStartEnabled(false);
    iziToast.error({
      message: 'Please choose a date in the future',
      position: 'topRight',
    });
    return;
  }

  userSelectedDate = selectedDate;
  setStartEnabled(true);
}

const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  onClose(selectedDates) {
    console.log(selectedDates[0]);
    validateSelectedDate(selectedDates[0]);
  },
};

flatpickr(datetimePicker, options);

function stopTimer() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function onTimerFinished() {
  showZeroTimer();
  stopTimer();
  datetimePicker.disabled = false;
  setStartEnabled(false);
}

function tick() {
  const ms = userSelectedDate.getTime() - Date.now();

  if (ms <= 0) {
    onTimerFinished();
    return;
  }

  updateTimerDisplay(convertMs(ms));
}

startBtn.addEventListener('click', () => {
  if (startBtn.disabled || !userSelectedDate) {
    return;
  }

  stopTimer();
  startBtn.disabled = true;
  datetimePicker.disabled = true;

  tick();
  intervalId = setInterval(tick, 1000);
});
