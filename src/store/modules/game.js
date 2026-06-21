import { defineStore } from 'pinia';

const BASE_RESOURCE_CAP = {
  food: 200,
  water: 200,
  wood: 300,
  stone: 300,
};

export const BUILDINGS = {
  fire: {
    id: 'fire',
    name: '火堆',
    icon: '🔥',
    desc: '驱散寒冷与野兽，烹饪食物，提升食物利用效率',
    maxLevel: 5,
    levels: [
      {
        level: 1,
        cost: { wood: 20, stone: 10 },
        requires: {},
        buildTime: 60000,
        effects: {
          foodConsumptionReduce: 0.1,
          gatherBonus: 1.2,
          desc: '基础火堆，食物消耗减少10%，采集食物效率+20%'
        }
      },
      {
        level: 2,
        cost: { wood: 40, stone: 25 },
        requires: { fire: 1 },
        buildTime: 120000,
        effects: {
          foodConsumptionReduce: 0.2,
          gatherBonus: 1.4,
          unlockCook: true,
          desc: '更大的火堆，食物消耗减少20%，解锁「烹饪食物」操作'
        }
      },
      {
        level: 3,
        cost: { wood: 80, stone: 50 },
        requires: { fire: 2 },
        buildTime: 180000,
        effects: {
          foodConsumptionReduce: 0.35,
          gatherBonus: 1.6,
          warmthBonus: true,
          desc: '坚固的石灶，食物消耗减少35%，夜间保持温暖'
        }
      },
      {
        level: 4,
        cost: { wood: 150, stone: 100 },
        requires: { fire: 3 },
        buildTime: 300000,
        effects: {
          foodConsumptionReduce: 0.5,
          gatherBonus: 2,
          smokeBonus: true,
          desc: '巨大的烽火台，食物消耗减少50%，烟雾可发出求救信号'
        }
      },
      {
        level: 5,
        cost: { wood: 300, stone: 200 },
        requires: { fire: 4 },
        buildTime: 600000,
        effects: {
          foodConsumptionReduce: 0.65,
          gatherBonus: 2.5,
          rescueSignal: true,
          desc: '永恒之火，食物消耗减少65%，可发射救援信号（游戏胜利条件之一'
        }
      }
    ]
  },

  purifier: {
    id: 'purifier',
    name: '净水器',
    icon: '💧',
    desc: '净化海水，自动产出淡水，提升水资源效率',
    maxLevel: 5,
    levels: [
      {
        level: 1,
        cost: { wood: 30, stone: 15 },
        requires: {},
        buildTime: 90000,
        effects: {
          waterConsumptionReduce: 0.1,
          waterAutoProduce: 3,
          collectWaterBonus: 1.3,
          desc: '简易过滤装置，淡水消耗减少10%，每分钟自动产出3淡水，收集淡水效率+30%'
        }
      },
      {
        level: 2,
        cost: { wood: 60, stone: 40 },
        requires: { purifier: 1, fire: 1 },
        buildTime: 180000,
        effects: {
          waterConsumptionReduce: 0.2,
          waterAutoProduce: 6,
          collectWaterBonus: 1.6,
          desc: '煮沸消毒装置，淡水消耗减少20%，每分钟自动产出6淡水'
        }
      },
      {
        level: 3,
        cost: { wood: 120, stone: 80 },
        requires: { purifier: 2 },
        buildTime: 240000,
        effects: {
          waterConsumptionReduce: 0.35,
          waterAutoProduce: 10,
          collectWaterBonus: 2,
          unlockDesalinate: true,
          desc: '蒸馏装置，解锁「海水淡化」高级操作'
        }
      },
      {
        level: 4,
        cost: { wood: 200, stone: 150 },
        requires: { purifier: 3 },
        buildTime: 360000,
        effects: {
          waterConsumptionReduce: 0.5,
          waterAutoProduce: 15,
          collectWaterBonus: 2.5,
          desc: '工业级净化器，淡水消耗减少50%，每分钟产出15淡水'
        }
      },
      {
        level: 5,
        cost: { wood: 400, stone: 300 },
        requires: { purifier: 4 },
        buildTime: 720000,
        effects: {
          waterConsumptionReduce: 0.7,
          waterAutoProduce: 25,
          collectWaterBonus: 3,
          infiniteWater: true,
          desc: '永续水循环系统，淡水消耗减少70%，每分钟产出25淡水'
        }
      }
    ]
  },

  warehouse: {
    id: 'warehouse',
    name: '仓库',
    icon: '📦',
    desc: '扩大资源储存上限，解锁高级工具和资源运输',
    maxLevel: 5,
    levels: [
      {
        level: 1,
        cost: { wood: 40, stone: 20 },
        requires: {},
        buildTime: 120000,
        effects: {
          storageMultiplier: 1.5,
          chopWoodBonus: 1.2,
          mineStoneBonus: 1.2,
          desc: '简易仓库，资源上限提升50%，砍伐/挖掘效率+20%'
        }
      },
      {
        level: 2,
        cost: { wood: 80, stone: 60 },
        requires: { warehouse: 1 },
        buildTime: 240000,
        effects: {
          storageMultiplier: 2,
          chopWoodBonus: 1.5,
          mineStoneBonus: 1.5,
          unlockCrafting: true,
          desc: '加固仓库，资源上限提升100%，解锁「批量制作工具」'
        }
      },
      {
        level: 3,
        cost: { wood: 160, stone: 120 },
        requires: { warehouse: 2, fire: 2 },
        buildTime: 360000,
        effects: {
          storageMultiplier: 3,
          chopWoodBonus: 2,
          mineStoneBonus: 2,
          unlockTransport: true,
          desc: '大型仓库，资源上限提升200%，解锁「资源运输」机制'
        }
      },
      {
        level: 4,
        cost: { wood: 320, stone: 240 },
        requires: { warehouse: 3 },
        buildTime: 480000,
        effects: {
          storageMultiplier: 5,
          chopWoodBonus: 2.5,
          mineStoneBonus: 2.5,
          unlockAdvanced: true,
          desc: '豪华仓库，资源上限提升400%，解锁「高级建造」'
        }
      },
      {
        level: 5,
        cost: { wood: 500, stone: 400 },
        requires: { warehouse: 4, purifier: 3 },
        buildTime: 900000,
        effects: {
          storageMultiplier: 10,
          chopWoodBonus: 3,
          mineStoneBonus: 3,
          autoGather: true,
          desc: '超级仓库基地，资源上限提升900%，每分钟自动收集资源'
        }
      }
    ]
  }
};

export const useGameStore = defineStore('game', {
  state: () => ({
    resources: {
      food: 100,
      water: 100,
      wood: 100,
      stone: 100
    },
    buildingLevels: {
      fire: 0,
      purifier: 0,
      warehouse: 0
    },
    buildingInProgress: null,
    buildingProgressEnd: null,
    gameStartTime: Date.now()
  }),

  getters: {
    resourceCapacity: (state) => {
      const mult = getBuildingEffects(state).storageMultiplier || 1;
      return {
        food: Math.floor(BASE_RESOURCE_CAP.food * mult),
        water: Math.floor(BASE_RESOURCE_CAP.water * mult),
        wood: Math.floor(BASE_RESOURCE_CAP.wood * mult),
        stone: Math.floor(BASE_RESOURCE_CAP.stone * mult),
      };
    },

    effects: (state) => getBuildingEffects(state),

    isBuildingUnlocked: (state) => (buildingId) => {
      const building = BUILDINGS[buildingId];
      if (!building) return false;
      const currentLevel = state.buildingLevels[buildingId];
      if (currentLevel >= building.maxLevel) return false;
      const nextLevel = building.levels[currentLevel];
      if (!nextLevel) return false;
      for (const [reqId, reqLevel] of Object.entries(nextLevel.requires)) {
        if (state.buildingLevels[reqId] < reqLevel) return false;
      }
      return true;
    },

    canBuild: (state) => (buildingId) => {
      const building = BUILDINGS[buildingId];
      if (!building) return false;
      const currentLevel = state.buildingLevels[buildingId];
      if (currentLevel >= building.maxLevel) return false;
      const nextLevel = building.levels[currentLevel];
      if (!nextLevel) return false;
      for (const [reqId, reqLevel] of Object.entries(nextLevel.requires)) {
        if (state.buildingLevels[reqId] < reqLevel) return false;
      }
      for (const [res, amount] of Object.entries(nextLevel.cost)) {
        if (state.resources[res] < amount) return false;
      }
      return true;
    },

    getBuildingInfo: (state) => (buildingId) => {
      const building = BUILDINGS[buildingId];
      if (!building) return null;
      const level = state.buildingLevels[buildingId];
      const nextLevel = building.levels[level] || null;
      const currentEffects = level > 0 ? building.levels[level - 1].effects : null;
      return {
        ...building,
        currentLevel: level,
        nextLevel,
        currentEffects,
        isMaxLevel: level >= building.maxLevel
      };
    },

    getGatherFoodAmount: (state) => (baseAmount) => {
      const bonus = getBuildingEffects(state).gatherBonus || 1;
      return Math.floor(baseAmount * bonus);
    },

    getCollectWaterAmount: (state) => (baseAmount) => {
      const bonus = getBuildingEffects(state).collectWaterBonus || 1;
      return Math.floor(baseAmount * bonus);
    },

    getChopWoodAmount: (state) => (baseAmount) => {
      const bonus = getBuildingEffects(state).chopWoodBonus || 1;
      return Math.floor(baseAmount * bonus);
    },

    getMineStoneAmount: (state) => (baseAmount) => {
      const bonus = getBuildingEffects(state).mineStoneBonus || 1;
      return Math.floor(baseAmount * bonus);
    },

    getFoodConsumption: (state) => (baseAmount) => {
      const reduce = getBuildingEffects(state).foodConsumptionReduce || 0;
      return Math.max(0, Math.floor(baseAmount * (1 - reduce)));
    },

    getWaterConsumption: (state) => (baseAmount) => {
      const reduce = getBuildingEffects(state).waterConsumptionReduce || 0;
      return Math.max(0, Math.floor(baseAmount * (1 - reduce)));
    }
  },

  actions: {
    addResource(type, amount) {
      const capacity = this.resourceCapacity;
      this.resources[type] = Math.min(
        this.resources[type] + amount,
        capacity[type]
      );
    },

    consumeResource(type, amount) {
      if (this.resources[type] >= amount) {
        this.resources[type] -= amount;
        return true;
      }
      return false;
    },

    canAfford(cost) {
      for (const [res, amount] of Object.entries(cost || {})) {
        if (this.resources[res] < amount) return false;
      }
      return true;
    },

    payCost(cost) {
      if (!this.canAfford(cost)) return false;
      for (const [res, amount] of Object.entries(cost || {})) {
        this.resources[res] -= amount;
      }
      return true;
    },

    startBuilding(buildingId) {
      const building = BUILDINGS[buildingId];
      if (!building) return { success: false, message: '建筑不存在' };
      const currentLevel = this.buildingLevels[buildingId];
      if (currentLevel >= building.maxLevel) {
        return { success: false, message: '已达到最高等级' };
      }
      const nextLevel = building.levels[currentLevel];
      if (!nextLevel) return { success: false, message: '无效等级' };

      for (const [reqId, reqLevel] of Object.entries(nextLevel.requires)) {
        if (this.buildingLevels[reqId] < reqLevel) {
          return { success: false, message: `需要先建造 ${BUILDINGS[reqId].name} Lv.${reqLevel}` };
        }
      }
      if (!this.payCost(nextLevel.cost)) {
        return { success: false, message: '资源不足' };
      }
      this.buildingInProgress = buildingId;
      this.buildingProgressEnd = Date.now() + nextLevel.buildTime;
      return { success: true, message: `开始建造${building.name} Lv.${nextLevel.level}` };
    },

    completeBuilding() {
      if (this.buildingInProgress && Date.now() >= this.buildingProgressEnd) {
        const buildingId = this.buildingInProgress;
        this.buildingLevels[buildingId] += 1;
        const level = this.buildingLevels[buildingId];
        this.buildingInProgress = null;
        this.buildingProgressEnd = null;
        return { success: true, buildingId, level };
      }
      return null;
    },

    tickProduction() {
      const effects = this.effects;
      if (effects.waterAutoProduce) {
        this.addResource('water', effects.waterAutoProduce);
      }
      if (effects.autoGather) {
        this.addResource('food', 2);
        this.addResource('wood', 1);
        this.addResource('stone', 1);
      }
    },

    tickConsumption() {
      const foodUse = this.getFoodConsumption(5);
      const waterUse = this.getWaterConsumption(5);
      this.resources.food = Math.max(0, this.resources.food - foodUse);
      this.resources.water = Math.max(0, this.resources.water - waterUse);
      return { foodUse, waterUse };
    },

    resetGame() {
      this.resources = { food: 100, water: 100, wood: 100, stone: 100 };
      this.buildingLevels = { fire: 0, purifier: 0, warehouse: 0 };
      this.buildingInProgress = null;
      this.buildingProgressEnd = null;
    }
  }
});

function getBuildingEffects(state) {
  const effects = {};
  for (const id of Object.keys(BUILDINGS)) {
    const level = state.buildingLevels[id];
    if (level > 0) {
      const levelData = BUILDINGS[id].levels[level - 1];
      if (levelData?.effects) {
        Object.assign(effects, levelData.effects);
      }
    }
  }
  return effects;
}

export default useGameStore;
