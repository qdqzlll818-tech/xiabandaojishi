(function (root) {
  'use strict';

  const MOODS = {
    calm: {
      key: 'calm',
      label: '平静上班',
      headline: '今天还早，别高兴得太早',
      detail: '先装一会儿忙，时间会自己走。',
    },
    anticipating: {
      key: 'anticipating',
      label: '开始期待',
      headline: '可以开始偷偷期待了',
      detail: '离自由又近了一点，先别表现得太明显。',
    },
    watching: {
      key: 'watching',
      label: '下班预备阶段',
      headline: '心已经开始往工位外面飘了',
      detail: '可以悄悄想晚饭了。',
    },
    excited: {
      key: 'excited',
      label: '不到 1 小时',
      headline: '请各部门谨言慎行',
      detail: '现在最怕听见一句“在吗”。',
    },
    alert: {
      key: 'alert',
      label: '高度警觉',
      headline: '请停止新增需求',
      detail: '现在说的新东西，默认明天处理。',
    },
    sensitive: {
      key: 'sensitive',
      label: '最后几分钟',
      headline: '谁都别说话',
      detail: '这时候来消息，性质就变了。',
    },
    holding: {
      key: 'holding',
      label: '屏息等待',
      headline: '下班自由近在眼前',
      detail: '再坚持一下，手先离开工作群。',
    },
    offwork: {
      key: 'offwork',
      label: '今日营业结束',
      headline: '谁的需求谁自己做',
      detail: '现在说什么都晚了。',
    },
    overtime: {
      key: 'overtime',
      label: '已进入加班状态',
      headline: '为什么我还在这里',
      detail: '这已经不是下班倒计时了。',
    },
  };

  const FRIDAY_MOODS = {
    calm: {
      key: 'friday-calm',
      label: '今天可是周五',
      headline: '今天可是周五',
      detail: '做事请适量。',
    },
    anticipating: {
      key: 'friday-anticipating',
      label: '开始期待',
      headline: '可以开始期待了',
      detail: '人还在公司，心可以先走一点。',
    },
    preparing: {
      key: 'friday-preparing',
      label: '周末预备状态',
      headline: '已进入周末预备状态',
      detail: '有些事情真的没必要今天解决。',
    },
    noNewWork: {
      key: 'friday-no-new-work',
      label: '停止开展新项目',
      headline: '请不要开展任何新项目',
      detail: '我们之间没必要在周五下午建立新的工作关系。',
    },
    loading: {
      key: 'friday-loading',
      label: '周末加载中',
      headline: '周末正在加载',
      detail: '现在发来的需求，下周一自动生效。',
    },
    handsOff: {
      key: 'friday-hands-off',
      label: '马上自由',
      headline: '谁都别碰我',
      detail: '我马上就是自由人了。',
    },
    quiet: {
      key: 'friday-quiet',
      label: '保持安静',
      headline: '保持安静',
      detail: '周末自由近在眼前。',
    },
    unlocked: {
      key: 'friday-unlocked',
      label: 'WEEKEND UNLOCKED',
      headline: '可以走了',
      detail: '剩下的事，下周一的我会想办法。',
    },
    overtime: {
      key: 'friday-overtime',
      label: 'WEEKEND UNLOCKED',
      headline: '可以走了',
      detail: '周末已经开始了，为什么我还在这里。',
    },
  };

  const FRIDAY_DEMAND_COPIES = [
    ['今天？？？', '要不要先看看今天星期几。'],
    ['又来？', '周五下午不宜建立新的工作关系。'],
    ['下周一见', '本系统已拒绝继续讨论。'],
  ];

  function parseClock(value, baseDate = new Date()) {
    const match = /^(\d{2}):(\d{2})$/.exec(value || '');
    const hours = match ? Number(match[1]) : 18;
    const minutes = match ? Number(match[2]) : 0;
    const target = new Date(baseDate);
    target.setHours(hours, minutes, 0, 0);
    return target;
  }

  function formatDuration(seconds) {
    const safe = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const secs = safe % 60;
    return [hours, minutes, secs].map((part) => String(part).padStart(2, '0')).join(':');
  }

  function getMood(secondsRemaining) {
    if (secondsRemaining > 10800) return MOODS.calm;
    if (secondsRemaining > 7200) return MOODS.anticipating;
    if (secondsRemaining > 3600) return MOODS.watching;
    if (secondsRemaining > 1800) return MOODS.excited;
    if (secondsRemaining >= 600) return MOODS.alert;
    if (secondsRemaining > 60) return MOODS.sensitive;
    if (secondsRemaining > 0) return MOODS.holding;
    if (secondsRemaining > -1800) return MOODS.offwork;
    return MOODS.overtime;
  }

  function resolvePersona(date = new Date(), override = '') {
    if (override === 'normal' || override === 'friday') return override;
    return date.getDay() === 5 ? 'friday' : 'normal';
  }

  function getFridayMood(secondsRemaining) {
    if (secondsRemaining > 10800) return FRIDAY_MOODS.calm;
    if (secondsRemaining > 7200) return FRIDAY_MOODS.anticipating;
    if (secondsRemaining > 3600) return FRIDAY_MOODS.preparing;
    if (secondsRemaining >= 1800) return FRIDAY_MOODS.noNewWork;
    if (secondsRemaining >= 600) return FRIDAY_MOODS.loading;
    if (secondsRemaining >= 60) return FRIDAY_MOODS.handsOff;
    if (secondsRemaining > 0) return FRIDAY_MOODS.quiet;
    if (secondsRemaining > -1800) return FRIDAY_MOODS.unlocked;
    return FRIDAY_MOODS.overtime;
  }

  function getFridayDemandCopy(clickCount) {
    const index = Math.min(Math.max(1, Number(clickCount) || 1), FRIDAY_DEMAND_COPIES.length) - 1;
    return [...FRIDAY_DEMAND_COPIES[index]];
  }

  const api = { parseClock, formatDuration, getMood, resolvePersona, getFridayMood, getFridayDemandCopy };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.OffworkCountdown = api;

  if (typeof document !== 'undefined') {
    const COPY_VARIANTS = {
      calm: [
        ['今天还早，别高兴得太早', '先装一会儿忙，时间会自己走。'],
        ['现在谈下班，有点为时尚早', '先把表格打开，显得事情很有进展。'],
      ],
      anticipating: [
        ['可以开始偷偷期待了', '离自由又近了一点，先别表现得太明显。'],
        ['今天也不是完全没有盼头', '保持低调，工位已经留不住心了。'],
      ],
      watching: [
        ['心已经开始往工位外面飘了', '可以悄悄想晚饭了。'],
        ['已进入下班预备阶段', '人还在，灵魂正在收拾东西。'],
      ],
      excited: [
        ['请各部门谨言慎行', '还有不到 1 小时，现在最怕听见一句“在吗”。'],
        ['倒计时已进入危险区', '今天不会再来需求了吧。'],
      ],
      alert: [
        ['请停止新增需求', '现在说的新东西，默认明天处理。'],
        ['大家都冷静一点', '马上就下班了，不要突然产生灵感。'],
      ],
      sensitive: [
        ['谁都别说话', '这时候来消息，性质就变了。'],
        ['最后几分钟，请不要轻举妄动', '电脑没关，心已经关机了。'],
      ],
      holding: [
        ['下班自由近在眼前', '再坚持一下，手先离开工作群。'],
        ['就快到了', '现在每一秒都有自己的尊严。'],
      ],
      offwork: [
        ['谁的需求谁自己做', '现在说什么都晚了。'],
        ['今日营业到此结束', '消息可以发，回复要看缘分。'],
      ],
      overtime: [
        ['为什么我还在这里', '这已经不是下班倒计时了。'],
        ['事情开始变得不礼貌了', '已进入加班状态，请勿追加剧情。'],
      ],
    };

    const demandCopies = [
      ['检测到新需求', '你认真的吗？我快下班了。'],
      ['现在加需求不太合适吧', '这个时间点，多少带点私人恩怨。'],
      ['别这样，我快下班了', '需求已收到，情绪暂时没有。'],
    ];

    const els = {
      body: document.body,
      brand: document.querySelector('#brand-copy'),
      input: document.querySelector('#offwork-time'),
      countdown: document.querySelector('#countdown'),
      prefix: document.querySelector('#clock-prefix'),
      label: document.querySelector('#status-label'),
      target: document.querySelector('#target-copy'),
      headline: document.querySelector('#mood-headline'),
      detail: document.querySelector('#mood-detail'),
      button: document.querySelector('#demand-button'),
      note: document.querySelector('#tiny-note'),
      sparks: document.querySelector('#sparks'),
      personaButtons: [...document.querySelectorAll('[data-persona-choice]')],
    };

    const params = new URLSearchParams(location.search);
    let targetClock = localStorage.getItem('offwork-time') || '18:00';
    let demandUntil = 0;
    let demandIndex = 0;
    let fridayDemandCount = params.has('previewEvent') || params.has('previewFridayEvent') ? 1 : 0;
    let lastFridayDemandAt = 0;
    let previousSeconds = null;
    let hasCelebrated = false;

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(targetClock)) targetClock = '18:00';
    els.input.value = targetClock;

    function previewNow() {
      const preview = params.get('previewFridayEvent') || params.get('previewFriday') || params.get('previewEvent') || params.get('preview');
      if (!preview) return new Date();
      const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(preview);
      if (!match) return new Date();
      const now = new Date();
      now.setHours(Number(match[1]), Number(match[2]), Number(match[3] || 0), 0);
      return now;
    }

    function chooseCopy(moodKey, seconds) {
      const variants = COPY_VARIANTS[moodKey];
      const stableMinute = Math.floor(Math.abs(seconds) / 60);
      return variants[stableMinute % variants.length];
    }

    function celebrate() {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      els.body.classList.add('just-left');
      els.sparks.replaceChildren();
      const friday = els.body.dataset.persona === 'friday';
      const colors = friday ? ['#d9ff36', '#20211d'] : ['#c7f43b', '#20211d', '#ff7657'];
      const particleCount = friday ? 10 : 22;
      for (let i = 0; i < particleCount; i += 1) {
        const spark = document.createElement('i');
        spark.className = 'spark';
        spark.style.left = `${6 + Math.random() * 88}%`;
        spark.style.background = colors[i % colors.length];
        spark.style.animationDelay = `${Math.random() * .32}s`;
        spark.style.setProperty('--drift', `${-110 + Math.random() * 220}px`);
        spark.style.setProperty('--spin', `${-260 + Math.random() * 520}deg`);
        els.sparks.append(spark);
      }
      setTimeout(() => {
        els.body.classList.remove('just-left');
        els.sparks.replaceChildren();
      }, 2000);
    }

    function render(now = previewNow()) {
      const target = parseClock(targetClock, now);
      const seconds = Math.floor((target - now) / 1000);
      const previewOverride = params.has('previewFriday') || params.has('previewFridayEvent') ? 'friday' : params.get('mode');
      const persona = resolvePersona(now, previewOverride);
      const isFriday = persona === 'friday';
      const mood = isFriday ? getFridayMood(seconds) : getMood(seconds);
      const isDemand = Date.now() < demandUntil || params.get('event') === '1' || params.has('previewEvent') || params.has('previewFridayEvent');

      els.body.dataset.persona = persona;
      els.body.dataset.mood = mood.key;
      els.brand.textContent = isFriday ? '周末解锁中' : '下班倒计时';
      els.target.textContent = `目标 ${targetClock}`;
      els.label.textContent = isDemand ? (isFriday ? '新增需求' : '突发情况') : mood.label;
      els.personaButtons.forEach((button) => button.setAttribute('aria-current', String(button.dataset.personaChoice === persona)));

      if (seconds > 0) {
        els.countdown.textContent = formatDuration(seconds);
        els.countdown.dateTime = `PT${seconds}S`;
        els.prefix.textContent = isFriday ? '距离自由还有' : '距离下班还有';
      } else {
        els.countdown.textContent = '已下班';
        els.countdown.dateTime = 'PT0S';
        els.prefix.textContent = isFriday ? 'WEEKEND UNLOCKED' : (seconds <= -1800 ? `已经晚了 ${formatDuration(Math.abs(seconds))}` : '打卡时间已到');
      }

      if (isDemand) {
        const [headline, detail] = isFriday
          ? getFridayDemandCopy(Math.max(1, fridayDemandCount))
          : demandCopies[demandIndex % demandCopies.length];
        els.headline.textContent = headline;
        els.detail.textContent = detail;
        els.note.textContent = isFriday ? '周五拒绝临时剧情' : '系统没崩，打工人崩了';
      } else {
        const [headline, detail] = isFriday
          ? [mood.headline, mood.detail]
          : chooseCopy(mood.key, seconds);
        els.headline.textContent = headline;
        els.detail.textContent = detail;
        els.note.textContent = isFriday
          ? (seconds <= 0 ? '周末已解锁' : '周末加载中……')
          : mood.key === 'offwork' ? '请立刻离开工位' : mood.key === 'overtime' ? '建议停止懂事' : '本组件正在替你盯表';
      }

      if (previousSeconds !== null && previousSeconds > 0 && seconds <= 0 && !hasCelebrated) {
        hasCelebrated = true;
        celebrate();
      }
      previousSeconds = seconds;
    }

    function triggerDemand() {
      const now = previewNow();
      const previewOverride = params.has('previewFriday') || params.has('previewFridayEvent') ? 'friday' : params.get('mode');
      const persona = resolvePersona(now, previewOverride);
      if (persona === 'friday') {
        const clickedAt = Date.now();
        fridayDemandCount = clickedAt - lastFridayDemandAt <= 8000 ? fridayDemandCount + 1 : 1;
        fridayDemandCount = Math.min(fridayDemandCount, 3);
        lastFridayDemandAt = clickedAt;
      }
      demandIndex = (demandIndex + 1) % demandCopies.length;
      demandUntil = Date.now() + 2600;
      els.body.classList.remove('is-breaking');
      void els.body.offsetWidth;
      els.body.classList.add('is-breaking');
      render();
      setTimeout(() => {
        els.body.classList.remove('is-breaking');
        render();
      }, 2600);
    }

    els.input.addEventListener('change', () => {
      if (!els.input.value) return;
      targetClock = els.input.value;
      localStorage.setItem('offwork-time', targetClock);
      previousSeconds = null;
      hasCelebrated = false;
      render();
    });
    els.button.addEventListener('click', triggerDemand);
    els.personaButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const url = new URL(location.href);
        const choice = button.dataset.personaChoice;
        if (choice === 'normal') {
          if (url.searchParams.has('previewFriday')) {
            url.searchParams.set('preview', url.searchParams.get('previewFriday'));
            url.searchParams.delete('previewFriday');
          }
          if (url.searchParams.has('previewFridayEvent')) {
            url.searchParams.set('previewEvent', url.searchParams.get('previewFridayEvent'));
            url.searchParams.delete('previewFridayEvent');
          }
        }
        url.searchParams.set('mode', choice);
        location.href = url.toString();
      });
    });

    if (params.get('event') === '1' || params.has('previewEvent') || params.has('previewFridayEvent')) els.body.classList.add('is-breaking');
    render();
    setInterval(render, 1000);
  }
})(typeof window !== 'undefined' ? window : globalThis);

