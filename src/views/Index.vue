<template>
  <div class="island-container">
    <div class="island-header">
      <h1>🏝️ 海岛生存</h1>
      <p>在荒岛上建立你的生存基地 · 建造营地、提升效率、生存下去！</p>
    </div>

    <div class="island-main">
      <!-- 资源面板 -->
      <div class="stats-panel">
        <div class="stat-card">
          <div class="stat-icon">🍖</div>
          <div class="stat-content">
            <div class="stat-row">
              <span class="stat-number">{{ gameStore.resources.food }}</span>
              <span class="stat-cap">/ {{ gameStore.resourceCapacity.food }}</span>
            </div>
            <div class="stat-bar">
              <div class="stat-bar-fill food" :style="{ width: foodPercent + '%' }"></div>
            </div>
            <div class="stat-label-row">
              <span class="stat-label">食物</span>
              <span class="stat-bonus" v-if="foodBonus > 0">
                📈 +{{ Math.round((foodBonus - 1) * 100) }}%
              </span>
              <span class="stat-consume">消耗: {{ gameStore.getFoodConsumption(5) }}/分</span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💧</div>
          <div class="stat-content">
            <div class="stat-row">
              <span class="stat-number">{{ gameStore.resources.water }}</span>
              <span class="stat-cap">/ {{ gameStore.resourceCapacity.water }}</span>
            </div>
            <div class="stat-bar">
              <div class="stat-bar-fill water" :style="{ width: waterPercent + '%' }"></div>
            </div>
            <div class="stat-label-row">
              <span class="stat-label">淡水</span>
              <span class="stat-bonus" v-if="waterBonus > 0">
                <el-icon class="bonus-icon"><TrendCharts /></el-icon>
                +{{ Math.round((waterBonus - 1) * 100) }}%
              </span>
              <span class="stat-produce" v-if="gameStore.effects.waterAutoProduce">
                产出: +{{ gameStore.effects.waterAutoProduce }}/分
              </span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🪵</div>
          <div class="stat-content">
            <div class="stat-row">
              <span class="stat-number">{{ gameStore.resources.wood }}</span>
              <span class="stat-cap">/ {{ gameStore.resourceCapacity.wood }}</span>
            </div>
            <div class="stat-bar">
              <div class="stat-bar-fill wood" :style="{ width: woodPercent + '%' }"></div>
            </div>
            <div class="stat-label-row">
              <span class="stat-label">木材</span>
              <span class="stat-bonus" v-if="woodBonus > 0">
                <el-icon class="bonus-icon"><TrendCharts /></el-icon>
                +{{ Math.round((woodBonus - 1) * 100) }}%
              </span>
              <span class="stat-capacity">上限 ×{{ storageMult }}</span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⛏️</div>
          <div class="stat-content">
            <div class="stat-row">
              <span class="stat-number">{{ gameStore.resources.stone }}</span>
              <span class="stat-cap">/ {{ gameStore.resourceCapacity.stone }}</span>
            </div>
            <div class="stat-bar">
              <div class="stat-bar-fill stone" :style="{ width: stonePercent + '%' }"></div>
            </div>
            <div class="stat-label-row">
              <span class="stat-label">石头</span>
              <span class="stat-bonus" v-if="stoneBonus > 0">
                <el-icon class="bonus-icon"><TrendCharts /></el-icon>
                +{{ Math.round((stoneBonus - 1) * 100) }}%
              </span>
              <span class="stat-capacity">上限 ×{{ storageMult }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="main-grid">
        <!-- 营地建筑树 -->
        <div class="building-panel">
          <h3>🏕️ 营地建筑树</h3>
          <div class="building-hint" v-if="isBuildingInProgress">
            <span class="loading-icon">🔄</span>
            <span>正在建造：{{ currentBuildingName }} Lv.{{ currentBuildingNextLevel }}</span>
            <span class="progress-time">{{ buildingTimeLeft }}</span>
          </div>
          <div class="building-tree">
            <div
              v-for="(info, id) in buildingInfos"
              :key="id"
              class="building-node"
              :class="{
                'locked': !info.unlocked,
                'maxed': info.isMaxLevel,
                'can-build': info.canBuild && !isBuildingInProgress
              }"
            >
              <div class="building-icon">{{ BUILDINGS[id].icon }}</div>
              <div class="building-body">
                <div class="building-title">
                  <span class="building-name">{{ BUILDINGS[id].name }}</span>
                  <el-tag
                    v-if="info.currentLevel > 0"
                    type="success"
                    size="small"
                    class="level-tag"
                  >
                    Lv.{{ info.currentLevel }}
                  </el-tag>
                  <el-tag
                    v-else
                    type="info"
                    size="small"
                    class="level-tag"
                  >
                    未建造
                  </el-tag>
                </div>
                <div class="building-desc">{{ BUILDINGS[id].desc }}</div>

                <div v-if="info.currentEffects" class="current-effects">
                  <el-tag type="success" size="small" effect="plain">
                    ✨ {{ info.currentEffects.desc }}
                  </el-tag>
                </div>

                <div v-if="!info.isMaxLevel" class="next-info">
                  <div class="next-title">下一等级 Lv.{{ info.nextLevel.level }}:</div>
                  <div class="next-cost">
                    <span class="cost-label">需要: </span>
                    <span
                      v-for="(amount, res) in info.nextLevel.cost"
                      :key="res"
                      class="cost-item"
                      :class="{ insufficient: gameStore.resources[res] < amount }"
                    >
                      {{ resIcons[res] }}{{ amount }}
                    </span>
                  </div>
                  <div v-if="Object.keys(info.nextLevel.requires).length > 0" class="next-requires">
                    <span class="cost-label">前置: </span>
                    <span
                      v-for="(lvl, reqId) in info.nextLevel.requires"
                      :key="reqId"
                      class="req-item"
                      :class="{ locked: gameStore.buildingLevels[reqId] < lvl }"
                    >
                      {{ BUILDINGS[reqId].name }} Lv.{{ lvl }}
                    </span>
                  </div>
                  <div class="next-desc">📈 {{ info.nextLevel.effects.desc }}</div>
                  <div class="next-time">⏱️ 建造耗时: {{ formatTime(info.nextLevel.buildTime) }}</div>
                </div>

                <div v-if="info.isMaxLevel" class="maxed-badge">
                  <el-tag type="warning" effect="dark">🏆 最高等级</el-tag>
                </div>

                <div class="building-actions">
                  <el-button
                    v-if="!info.isMaxLevel"
                    type="primary"
                    size="small"
                    :disabled="!info.canBuild || isBuildingInProgress"
                    @click="buildBuilding(id)"
                  >
                    {{ info.currentLevel === 0 ? '建造' : '升级' }}
                  </el-button>
                  <span v-if="!info.unlocked && !info.isMaxLevel" class="lock-hint">
                    🔒 未满足前置条件
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作卡片 -->
        <div class="actions-panel">
          <h3>📋 可执行操作</h3>
          <div class="action-grid">
            <div class="action-card" :class="{ active: actionBusy }" @click="gatherFood">
              <div class="action-icon">🍓</div>
              <div class="action-title">采集食物</div>
              <div class="action-desc">在岛上寻找可食用的果实和动物</div>
              <div class="action-reward">获得: 🍖 {{ foodReward }}</div>
              <div class="action-time">耗时: 30秒</div>
            </div>

            <div class="action-card" :class="{ active: actionBusy }" @click="collectWater">
              <div class="action-icon">💧</div>
              <div class="action-title">收集淡水</div>
              <div class="action-desc">收集雨水或净化海水</div>
              <div class="action-reward">获得: 💧 {{ waterReward }}</div>
              <div class="action-time">耗时: 1分钟</div>
            </div>

            <div class="action-card" :class="{ active: actionBusy }" @click="chopWood">
              <div class="action-icon">🪓</div>
              <div class="action-title">砍伐木材</div>
              <div class="action-desc">砍伐树木获取木材资源</div>
              <div class="action-reward">获得: 🪵 {{ woodReward }}</div>
              <div class="action-time">耗时: 2分钟</div>
            </div>

            <div class="action-card" :class="{ active: actionBusy }" @click="mineStone">
              <div class="action-icon">⛏️</div>
              <div class="action-title">挖掘石头</div>
              <div class="action-desc">在岛上挖掘石头资源</div>
              <div class="action-reward">获得: ⛏️ {{ stoneReward }}</div>
              <div class="action-time">耗时: 3分钟</div>
            </div>

            <div
              class="action-card unlockable"
              :class="{ active: actionBusy, locked: !gameStore.effects.unlockCook }"
              @click="cookFood"
            >
              <div class="action-badge" v-if="gameStore.effects.unlockCook">NEW</div>
              <div class="action-lock" v-else>🔒 需要火堆 Lv.2</div>
              <div class="action-icon">🍳</div>
              <div class="action-title">烹饪食物</div>
              <div class="action-desc">用火堆烹饪食物，提升产出</div>
              <div class="action-reward">获得: 🍖 {{ cookReward }}</div>
              <div class="action-cost">需要: 🍖 10, 🪵 5</div>
              <div class="action-time">耗时: 45秒</div>
            </div>

            <div
              class="action-card unlockable"
              :class="{ active: actionBusy, locked: !gameStore.effects.unlockDesalinate }"
              @click="desalinateWater"
            >
              <div class="action-badge" v-if="gameStore.effects.unlockDesalinate">NEW</div>
              <div class="action-lock" v-else>🔒 需要净水器 Lv.3</div>
              <div class="action-icon">🌊</div>
              <div class="action-title">海水淡化</div>
              <div class="action-desc">高效蒸馏装置，大量产出淡水</div>
              <div class="action-reward">获得: 💧 {{ desalinateReward }}</div>
              <div class="action-cost">需要: 🪵 10, ⛏️ 5</div>
              <div class="action-time">耗时: 2分钟</div>
            </div>

            <div
              class="action-card unlockable"
              :class="{ active: actionBusy, locked: !gameStore.effects.unlockCrafting }"
              @click="craftBatchTools"
            >
              <div class="action-badge" v-if="gameStore.effects.unlockCrafting">NEW</div>
              <div class="action-lock" v-else>🔒 需要仓库 Lv.2</div>
              <div class="action-icon">🛠️</div>
              <div class="action-title">批量制作工具</div>
              <div class="action-desc">制作工具套装，获得大量建材</div>
              <div class="action-reward">获得: 🪵 +50, ⛏️ +50</div>
              <div class="action-cost">需要: 🪵 80, ⛏️ 60</div>
              <div class="action-time">耗时: 3分钟</div>
            </div>

            <div
              class="action-card unlockable"
              :class="{ active: actionBusy, locked: !gameStore.effects.unlockAdvanced }"
              @click="advancedBuild"
            >
              <div class="action-badge" v-if="gameStore.effects.unlockAdvanced">NEW</div>
              <div class="action-lock" v-else>🔒 需要仓库 Lv.4</div>
              <div class="action-icon">🏗️</div>
              <div class="action-title">高级建造</div>
              <div class="action-desc">调用大型工程，获得综合资源</div>
              <div class="action-reward">获得: 🍖+100 💧+100 🪵+200 ⛏️+200</div>
              <div class="action-cost">需要: 🪵 300, ⛏️ 250</div>
              <div class="action-time">耗时: 5分钟</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 生存日志 -->
      <div class="message-log">
        <h3>📜 生存日志</h3>
        <div class="log-list">
          <div v-for="(msg, index) in messageLog" :key="index" class="log-item">
            <span class="log-time">{{ msg.time }}</span>
            <span class="log-content">{{ msg.content }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useGameStore, BUILDINGS } from '../store/modules/game';

const gameStore = useGameStore();

const resIcons = {
  food: '🍖',
  water: '💧',
  wood: '🪵',
  stone: '⛏️'
};

const messageLog = ref([
  { time: '00:00', content: '你来到了一个荒岛，开始你的生存之旅吧！' }
]);

const actionBusy = ref(false);
const busyTimer = null;

let tickTimer = null;
let buildCheckTimer = null;

const foodPercent = computed(() => Math.min(100, (gameStore.resources.food / gameStore.resourceCapacity.food) * 100));
const waterPercent = computed(() => Math.min(100, (gameStore.resources.water / gameStore.resourceCapacity.water) * 100));
const woodPercent = computed(() => Math.min(100, (gameStore.resources.wood / gameStore.resourceCapacity.wood) * 100));
const stonePercent = computed(() => Math.min(100, (gameStore.resources.stone / gameStore.resourceCapacity.stone) * 100));

const foodBonus = computed(() => gameStore.effects.gatherBonus || 0);
const waterBonus = computed(() => gameStore.effects.collectWaterBonus || 0);
const woodBonus = computed(() => gameStore.effects.chopWoodBonus || 0);
const stoneBonus = computed(() => gameStore.effects.mineStoneBonus || 0);
const storageMult = computed(() => gameStore.effects.storageMultiplier || 1);

const foodReward = computed(() => gameStore.getGatherFoodAmount(20));
const waterReward = computed(() => gameStore.getCollectWaterAmount(30));
const woodReward = computed(() => gameStore.getChopWoodAmount(15));
const stoneReward = computed(() => gameStore.getMineStoneAmount(10));
const cookReward = computed(() => gameStore.getGatherFoodAmount(60));
const desalinateReward = computed(() => gameStore.getCollectWaterAmount(100));

const buildingInfos = computed(() => {
  const result = {};
  for (const id of Object.keys(BUILDINGS)) {
    const info = gameStore.getBuildingInfo(id);
    result[id] = {
      ...info,
      unlocked: gameStore.isBuildingUnlocked(id),
      canBuild: gameStore.canBuild(id)
    };
  }
  return result;
});

const isBuildingInProgress = computed(() => {
  return gameStore.buildingInProgress && Date.now() < gameStore.buildingProgressEnd;
});

const currentBuildingName = computed(() => {
  if (!gameStore.buildingInProgress) return '';
  return BUILDINGS[gameStore.buildingInProgress].name;
});

const currentBuildingNextLevel = computed(() => {
  if (!gameStore.buildingInProgress) return 0;
  return gameStore.buildingLevels[gameStore.buildingInProgress] + 1;
});

const buildingTimeLeft = ref('');

const formatTime = (ms) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m > 0) return `${m}分${sec}秒`;
  return `${sec}秒`;
};

const updateBuildingTime = () => {
  if (gameStore.buildingProgressEnd) {
    const left = Math.max(0, gameStore.buildingProgressEnd - Date.now());
    buildingTimeLeft.value = `(${formatTime(left)})`;
  } else {
    buildingTimeLeft.value = '';
  }
};

const addMessage = (content) => {
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  messageLog.value.push({ time, content });
  if (messageLog.value.length > 30) {
    messageLog.value.shift();
  }
};

const setBusy = (ms) => {
  actionBusy.value = true;
  if (busyTimer) clearTimeout(busyTimer);
  busyTimer = setTimeout(() => {
    actionBusy.value = false;
  }, ms);
};

const performAction = (name, cost, gain, time, onSuccess) => {
  if (actionBusy.value) {
    ElMessage.warning('正在执行其他操作，请稍候...');
    return false;
  }
  for (const [resource, amount] of Object.entries(cost || {})) {
    if (gameStore.resources[resource] < amount) {
      ElMessage.error(`资源不足，无法${name}`);
      return false;
    }
  }
  for (const [resource, amount] of Object.entries(cost || {})) {
    gameStore.resources[resource] -= amount;
  }
  addMessage(`开始${name}...`);
  setBusy(time);
  setTimeout(() => {
    for (const [resource, amount] of Object.entries(gain || {})) {
      gameStore.addResource(resource, amount);
    }
    const gainText = Object.entries(gain || {})
      .map(([k, v]) => `${resIcons[k] || ''}${v}`)
      .join('、');
    addMessage(`${name}完成！获得了${gainText || '完成'}`);
    ElMessage.success(`${name}完成！${gainText ? '获得 ' + gainText : ''}`);
    if (onSuccess) onSuccess();
  }, time);
  return true;
};

const gatherFood = () => performAction('采集食物', {}, { food: foodReward.value }, 30000);
const collectWater = () => performAction('收集淡水', {}, { water: waterReward.value }, 60000);
const chopWood = () => performAction('砍伐木材', {}, { wood: woodReward.value }, 120000);
const mineStone = () => performAction('挖掘石头', {}, { stone: stoneReward.value }, 180000);
const cookFood = () => {
  if (!gameStore.effects.unlockCook) {
    ElMessage.warning('需要先建造火堆 Lv.2 才能烹饪食物');
    return;
  }
  performAction('烹饪食物', { food: 10, wood: 5 }, { food: cookReward.value }, 45000);
};
const desalinateWater = () => {
  if (!gameStore.effects.unlockDesalinate) {
    ElMessage.warning('需要先建造净水器 Lv.3 才能海水淡化');
    return;
  }
  performAction('海水淡化', { wood: 10, stone: 5 }, { water: desalinateReward.value }, 120000);
};
const craftBatchTools = () => {
  if (!gameStore.effects.unlockCrafting) {
    ElMessage.warning('需要先建造仓库 Lv.2 才能批量制作');
    return;
  }
  performAction('批量制作工具', { wood: 80, stone: 60 }, { wood: 50, stone: 50 }, 180000);
};
const advancedBuild = () => {
  if (!gameStore.effects.unlockAdvanced) {
    ElMessage.warning('需要先建造仓库 Lv.4 才能使用高级建造');
    return;
  }
  performAction(
    '高级建造',
    { wood: 300, stone: 250 },
    { food: 100, water: 100, wood: 200, stone: 200 },
    300000
  );
};

const buildBuilding = (id) => {
  const result = gameStore.startBuilding(id);
  if (!result.success) {
    ElMessage.error(result.message);
    return;
  }
  addMessage(result.message);
  ElMessage.success(result.message);
  updateBuildingTime();
};

const checkBuildingComplete = () => {
  updateBuildingTime();
  if (gameStore.buildingInProgress && Date.now() >= gameStore.buildingProgressEnd) {
    const buildingId = gameStore.buildingInProgress;
    const level = gameStore.buildingLevels[buildingId] + 1;
    gameStore.buildingLevels[buildingId] = level;
    gameStore.buildingInProgress = null;
    gameStore.buildingProgressEnd = null;
    const msg = `🎉 ${BUILDINGS[buildingId].name} 建造完成！当前等级 Lv.${level}`;
    addMessage(msg);
    ElMessage.success(msg);
  }
};

const gameTick = () => {
  const { foodUse, waterUse } = gameStore.tickConsumption();
  if (foodUse > 0 || waterUse > 0) {
    addMessage(`⏰ 时间流逝，消耗了 🍖${foodUse} 和 💧${waterUse}`);
  }
  gameStore.tickProduction();
  if (gameStore.effects.waterAutoProduce) {
    addMessage(`💧 净水器自动产出了 ${gameStore.effects.waterAutoProduce} 淡水`);
  }
  if (gameStore.effects.autoGather) {
    addMessage(`📦 仓库系统自动收集了基础资源`);
  }
  if (gameStore.resources.food <= 0 || gameStore.resources.water <= 0) {
    ElMessageBox.alert(
      '你的食物或水耗尽了，游戏结束！',
      '游戏结束',
      { confirmButtonText: '重新开始', type: 'error' }
    ).then(() => {
      gameStore.resetGame();
      messageLog.value = [{ time: '00:00', content: '你重新来到了荒岛，重新开始生存之旅！' }];
      addMessage('重新开始游戏！');
    });
  }
};

onMounted(() => {
  addMessage('🏕️ 欢迎来到海岛生存游戏！建造营地建筑来提升你的生存效率。');
  tickTimer = setInterval(gameTick, 60000);
  buildCheckTimer = setInterval(checkBuildingComplete, 1000);
  updateBuildingTime();
});

onUnmounted(() => {
  if (tickTimer) clearInterval(tickTimer);
  if (buildCheckTimer) clearInterval(buildCheckTimer);
  if (busyTimer) clearTimeout(busyTimer);
});
</script>

<style scoped>
.island-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #87ceeb 0%, #98d8c8 50%, #667eea 100%);
  padding: 20px;
  padding-bottom: 60px;
}

.island-header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
  padding: 20px;
}

.island-header h1 {
  font-size: 44px;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.25);
}

.island-header p {
  font-size: 16px;
  margin: 0;
  opacity: 0.95;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.15);
}

.island-main {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
  margin-bottom: 28px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 44px;
  margin-right: 16px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 6px;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #1f2937;
}

.stat-cap {
  font-size: 14px;
  color: #9ca3af;
  margin-left: 6px;
}

.stat-bar {
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.stat-bar-fill.food {
  background: linear-gradient(90deg, #f59e0b, #ef4444);
}
.stat-bar-fill.water {
  background: linear-gradient(90deg, #0ea5e9, #6366f1);
}
.stat-bar-fill.wood {
  background: linear-gradient(90deg, #a16207, #84cc16);
}
.stat-bar-fill.stone {
  background: linear-gradient(90deg, #6b7280, #9ca3af);
}

.stat-label-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
}

.stat-label {
  font-weight: 500;
  color: #374151;
}

.stat-bonus {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: #059669;
  background: #d1fae5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.bonus-icon {
  font-size: 11px;
}

.stat-consume {
  color: #dc2626;
  background: #fee2e2;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.stat-produce {
  color: #0891b2;
  background: #cffafe;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.stat-capacity {
  color: #7c3aed;
  background: #ede9fe;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.main-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 24px;
  margin-bottom: 28px;
}

.building-panel,
.actions-panel {
  background: rgba(255, 255, 255, 0.97);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.building-panel h3,
.actions-panel h3 {
  margin: 0 0 20px 0;
  font-size: 22px;
  color: #1f2937;
  font-weight: 700;
}

.building-hint {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
}

.loading-icon {
  animation: rotate 1.5s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.progress-time {
  margin-left: auto;
  font-weight: 600;
  opacity: 0.95;
}

.building-tree {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.building-node {
  display: flex;
  gap: 14px;
  padding: 18px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  transition: all 0.3s ease;
}

.building-node.can-build {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  box-shadow: 0 2px 12px rgba(16, 185, 129, 0.15);
}

.building-node.locked {
  opacity: 0.65;
  background: #f1f5f9;
}

.building-node.maxed {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.building-icon {
  font-size: 48px;
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.building-body {
  flex: 1;
  min-width: 0;
}

.building-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.building-name {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.level-tag {
  font-size: 11px;
}

.building-desc {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 10px;
  line-height: 1.5;
}

.current-effects {
  margin-bottom: 10px;
}

.next-info {
  padding: 10px 12px;
  background: #eff6ff;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 12px;
}

.next-title {
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 6px;
}

.next-cost,
.next-requires {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
}

.cost-label {
  color: #475569;
  font-weight: 500;
  flex-shrink: 0;
}

.cost-item,
.req-item {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  background: white;
  font-weight: 500;
  color: #0f172a;
  border: 1px solid #e2e8f0;
}

.cost-item.insufficient {
  color: #dc2626;
  background: #fef2f2;
  border-color: #fecaca;
}

.req-item.locked {
  color: #7c3aed;
  background: #f5f3ff;
  border-color: #ddd6fe;
}

.next-desc {
  color: #0369a1;
  margin: 6px 0;
  line-height: 1.5;
}

.next-time {
  color: #64748b;
}

.maxed-badge {
  margin-bottom: 10px;
}

.building-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.lock-hint {
  font-size: 12px;
  color: #7c3aed;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.action-card {
  position: relative;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.action-card:hover:not(.locked):not(.active) {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
  background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
}

.action-card.active {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-card.locked {
  opacity: 0.45;
  cursor: not-allowed;
  filter: grayscale(0.4);
}

.action-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
  letter-spacing: 0.5px;
}

.action-lock {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 11px;
  color: #64748b;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 6px;
}

.action-icon {
  font-size: 44px;
  margin-bottom: 10px;
}

.action-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 6px;
}

.action-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 10px;
}

.action-reward {
  font-size: 13px;
  color: #059669;
  font-weight: 600;
  background: #ecfdf5;
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 6px;
}

.action-cost {
  font-size: 12px;
  color: #7c3aed;
  margin-bottom: 4px;
}

.action-time {
  font-size: 11px;
  color: #9ca3af;
}

.message-log {
  background: rgba(255, 255, 255, 0.97);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.message-log h3 {
  margin: 0 0 20px 0;
  font-size: 22px;
  color: #1f2937;
  font-weight: 700;
}

.log-list {
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px;
  background: #f8fafc;
}

.log-item {
  display: flex;
  margin-bottom: 6px;
  padding: 8px 10px;
  background: white;
  border-radius: 8px;
  border-left: 3px solid #667eea;
  font-size: 13px;
  line-height: 1.5;
}

.log-time {
  font-weight: bold;
  color: #667eea;
  margin-right: 12px;
  min-width: 54px;
  flex-shrink: 0;
}

.log-content {
  flex: 1;
  color: #374151;
}

@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .island-container {
    padding: 12px;
  }

  .island-header h1 {
    font-size: 30px;
  }

  .island-header p {
    font-size: 13px;
  }

  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 14px;
  }

  .stat-icon {
    font-size: 32px;
    margin-right: 10px;
  }

  .stat-number {
    font-size: 20px;
  }

  .building-panel,
  .actions-panel,
  .message-log {
    padding: 18px;
    border-radius: 16px;
  }

  .building-icon {
    font-size: 36px;
    width: 52px;
    height: 52px;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>
