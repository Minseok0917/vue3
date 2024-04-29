const memorys = new WeakMap(); // Weakmap<객체,Map<키,Set<값>>>
let activeEffect;

// NOTE: 등록되어있는 종속된 Effects를 가져온다.
function subscribe(target, key) {
  const depsMap = memorys.get(target) ?? memorys.set(target, new Map()).get(target);
  const depEffects = depsMap.get(key) ?? depsMap.set(key, new Set()).get(key);
  return depEffects;
}

// NOTE: 반응성 객체 종속 함수들 Effects에 추가하기
function track(target, key) {
  activeEffect && subscribe(target, key).add(activeEffect);
}

// NOTE: 반응성 객체가 setter를 했을 때 종속된 함수들을 실행 시킨다.
function trigger(target, key) {
  subscribe(target, key).forEach((effect) => effect());
}

// NOTE: 얇은 Ref
function shallowRef(value) {
  const target = {
    get value() {
      track(target, "value");
      return value;
    },
    set value(newValue) {
      value = newValue;
      trigger(target, "value");
    },
  };
  return target;
}

// NOTE: 반응형 객체 종속 값
function computed(updated) {
  let value;
  const target = {
    get value() {
      track(target, "value");
      return value;
    },
  };

  // NOTE: 반응성 추가
  activeEffect = () => {
    value = updated();
    trigger(target, "value");
    console.log("실행을 시켰나?");
  };
  activeEffect();
  activeEffect = null;

  return target;
}

const name = shallowRef("민석");
const helloName = computed(() => `hello ${name.value}`);
