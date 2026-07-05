import { useState, useEffect, useRef, useCallback } from 'react'
import './index.css'

const STORAGE_KEY = 'jieshen_v1'

function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}
function saveData(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) }

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function daysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function calcStreak(checked) {
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = daysAgo(i)
    if (checked && checked[d]) streak++; else break
  }
  return streak
}

const QUOTES = [
  '清净不是压抑，是选择。','每一次克制，都是力量的体现。',
  '你比你想象的更自由。','欲望如浪，观其起落，终会平息。',
  '今日的坚持，是明日的底气。','戒不是禁锢，是醒觉。',
  '守住心念，守住人生。','一念清净，烦恼自息。',
]
const randomQuote = () => QUOTES[Math.floor(Math.random() * QUOTES.length)]

// ── Sports Database ─────────────────────────────────────────────────
const SPORTS_DATABASE = [
  // 拉伸 - 消耗约 3-4 kcal/min
  { id: 'stretch', name: '拉伸', icon: '🧘', category: '柔韧', caloriesPerMin: 4, unit: '分钟', desc: '柔韧训练，舒缓身心' },
  // 拳击 - 消耗约 10-12 kcal/min
  { id: 'boxing', name: '拳击', icon: '🥊', category: '爆发', caloriesPerMin: 11, unit: '分钟', desc: '高强度爆发训练' },
  // 力量训练 - 消耗约 6-8 kcal/min
  { id: 'strength', name: '力量', icon: '💪', category: '力量', caloriesPerMin: 7, unit: '分钟', desc: '肌肉力量训练' },
  // 有氧运动 - 消耗约 8-10 kcal/min
  { id: 'cardio', name: '有氧运动', icon: '🏃', category: '心肺', caloriesPerMin: 9, unit: '分钟', desc: '跑步、游泳、骑行等' },
  // 瑜伽 - 消耗约 3-5 kcal/min
  { id: 'yoga', name: '瑜伽', icon: '🧘‍♀️', category: '柔韧', caloriesPerMin: 4, unit: '分钟', desc: '身心平衡训练' },
  // 跳绳 - 消耗约 12 kcal/min
  { id: 'jumprope', name: '跳绳', icon: '🎯', category: '心肺', caloriesPerMin: 12, unit: '分钟', desc: '高效燃脂训练' },
  // 游泳 - 消耗约 10 kcal/min
  { id: 'swimming', name: '游泳', icon: '🏊', category: '心肺', caloriesPerMin: 10, unit: '分钟', desc: '全身运动，低冲击' },
  // 骑行 - 消耗约 8 kcal/min
  { id: 'cycling', name: '骑行', icon: '🚴', category: '心肺', caloriesPerMin: 8, unit: '分钟', desc: '户外有氧运动' },
]

const DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60]

// ── Clean/Beauty Database ─────────────────────────────────────────────
const CLEAN_DATABASE = [
  { id: 'hair', name: '发型', icon: '💇', category: '造型', desc: '洗发、剪发、造型' },
  { id: 'skincare', name: '护肤', icon: '✨', category: '护理', desc: '清洁、保湿、面膜' },
  { id: 'outfit', name: '穿搭', icon: '👔', category: '造型', desc: '搭配服装' },
  { id: 'makeup', name: '化妆', icon: '💄', category: '美妆', desc: '化妆、卸妆' },
]

function fmt(secs) {
  return `${String(Math.floor(secs/60)).padStart(2,'0')}:${String(secs%60).padStart(2,'0')}`
}

// ── Local Food Database ──────────────────────────────────────────────
const FOOD_DATABASE = [
  // 谷物类
  { name: '米饭', category: '主食', calories: 116, protein: 2.6, fat: 0.3, carbs: 25.9, unit: '100g' },
  { name: '馒头', category: '主食', calories: 223, protein: 7.0, fat: 1.1, carbs: 47.0, unit: '100g' },
  { name: '面条', category: '主食', calories: 284, protein: 8.3, fat: 0.8, carbs: 59.5, unit: '100g' },
  { name: '包子', category: '主食', calories: 227, protein: 9.1, fat: 5.9, carbs: 33.4, unit: '100g' },
  { name: '饺子', category: '主食', calories: 242, protein: 12.3, fat: 12.0, carbs: 24.3, unit: '100g' },
  { name: '油条', category: '主食', calories: 386, protein: 6.9, fat: 17.6, carbs: 51.0, unit: '100g' },
  { name: '煎饼', category: '主食', calories: 333, protein: 7.2, fat: 8.3, carbs: 57.7, unit: '100g' },
  { name: '烧饼', category: '主食', calories: 304, protein: 8.0, fat: 8.0, carbs: 52.0, unit: '100g' },
  { name: '面包', category: '主食', calories: 265, protein: 8.0, fat: 3.2, carbs: 50.0, unit: '100g' },
  { name: '披萨', category: '主食', calories: 266, protein: 11.0, fat: 10.0, carbs: 33.0, unit: '100g' },
  { name: '粥', category: '主食', calories: 46, protein: 1.1, fat: 0.2, carbs: 9.9, unit: '100g' },
  { name: '小米粥', category: '主食', calories: 46, protein: 1.4, fat: 0.7, carbs: 9.0, unit: '100g' },
  // 肉类
  { name: '猪肉', category: '肉类', calories: 143, protein: 21.3, fat: 6.1, carbs: 0, unit: '100g' },
  { name: '排骨', category: '肉类', calories: 264, protein: 16.7, fat: 21.0, carbs: 0.7, unit: '100g' },
  { name: '五花肉', category: '肉类', calories: 395, protein: 13.5, fat: 37.3, carbs: 0, unit: '100g' },
  { name: '牛肉', category: '肉类', calories: 125, protein: 22.3, fat: 3.7, carbs: 0, unit: '100g' },
  { name: '牛排', category: '肉类', calories: 271, protein: 26.8, fat: 17.6, carbs: 0, unit: '100g' },
  { name: '羊肉', category: '肉类', calories: 118, protein: 20.5, fat: 3.9, carbs: 0, unit: '100g' },
  { name: '鸡胸肉', category: '肉类', calories: 133, protein: 31.0, fat: 1.2, carbs: 0, unit: '100g' },
  { name: '鸡腿肉', category: '肉类', calories: 181, protein: 26.0, fat: 7.8, carbs: 0, unit: '100g' },
  { name: '炸鸡', category: '肉类', calories: 298, protein: 24.8, fat: 18.5, carbs: 8.5, unit: '100g' },
  { name: '鸭肉', category: '肉类', calories: 240, protein: 17.0, fat: 18.0, carbs: 0, unit: '100g' },
  { name: '烤鸭', category: '肉类', calories: 424, protein: 21.5, fat: 36.8, carbs: 0, unit: '100g' },
  { name: '火腿', category: '肉类', calories: 272, protein: 18.0, fat: 22.0, carbs: 0, unit: '100g' },
  { name: '香肠', category: '肉类', calories: 311, protein: 11.0, fat: 28.0, carbs: 2.0, unit: '100g' },
  { name: '培根', category: '肉类', calories: 457, protein: 13.0, fat: 45.0, carbs: 1.0, unit: '100g' },
  { name: '汉堡', category: '肉类', calories: 295, protein: 15.0, fat: 14.0, carbs: 30.0, unit: '100g' },
  { name: '热狗', category: '肉类', calories: 290, protein: 11.0, fat: 18.0, carbs: 22.0, unit: '100g' },
  // 海鲜类
  { name: '鱼肉', category: '海鲜', calories: 90, protein: 18.0, fat: 2.0, carbs: 0, unit: '100g' },
  { name: '虾', category: '海鲜', calories: 85, protein: 18.0, fat: 0.6, carbs: 0.8, unit: '100g' },
  { name: '螃蟹', category: '海鲜', calories: 97, protein: 18.5, fat: 2.0, carbs: 0.5, unit: '100g' },
  { name: '龙虾', category: '海鲜', calories: 77, protein: 17.0, fat: 0.9, carbs: 0.5, unit: '100g' },
  { name: '扇贝', category: '海鲜', calories: 60, protein: 12.0, fat: 0.6, carbs: 2.6, unit: '100g' },
  { name: '生蚝', category: '海鲜', calories: 66, protein: 10.0, fat: 2.0, carbs: 3.0, unit: '100g' },
  { name: '鱿鱼', category: '海鲜', calories: 75, protein: 14.0, fat: 0.8, carbs: 2.0, unit: '100g' },
  { name: '海参', category: '海鲜', calories: 71, protein: 16.5, fat: 0.1, carbs: 0.4, unit: '100g' },
  { name: '三文鱼', category: '海鲜', calories: 183, protein: 20.0, fat: 11.0, carbs: 0, unit: '100g' },
  { name: '金枪鱼', category: '海鲜', calories: 130, protein: 28.0, fat: 1.0, carbs: 0, unit: '100g' },
  // 蔬菜类
  { name: '白菜', category: '蔬菜', calories: 18, protein: 1.6, fat: 0.2, carbs: 3.1, unit: '100g' },
  { name: '青菜', category: '蔬菜', calories: 14, protein: 1.5, fat: 0.3, carbs: 1.8, unit: '100g' },
  { name: '菠菜', category: '蔬菜', calories: 20, protein: 2.4, fat: 0.3, carbs: 2.4, unit: '100g' },
  { name: '西兰花', category: '蔬菜', calories: 36, protein: 3.3, fat: 0.6, carbs: 5.0, unit: '100g' },
  { name: '西红柿', category: '蔬菜', calories: 15, protein: 0.9, fat: 0.2, carbs: 3.0, unit: '100g' },
  { name: '黄瓜', category: '蔬菜', calories: 12, protein: 0.7, fat: 0.1, carbs: 2.5, unit: '100g' },
  { name: '茄子', category: '蔬菜', calories: 23, protein: 1.0, fat: 0.1, carbs: 5.0, unit: '100g' },
  { name: '土豆', category: '蔬菜', calories: 76, protein: 2.0, fat: 0.1, carbs: 17.0, unit: '100g' },
  { name: '红薯', category: '蔬菜', calories: 99, protein: 1.4, fat: 0.2, carbs: 23.6, unit: '100g' },
  { name: '玉米', category: '蔬菜', calories: 112, protein: 4.0, fat: 1.2, carbs: 23.0, unit: '100g' },
  { name: '胡萝卜', category: '蔬菜', calories: 32, protein: 0.9, fat: 0.2, carbs: 7.1, unit: '100g' },
  { name: '南瓜', category: '蔬菜', calories: 26, protein: 1.0, fat: 0.1, carbs: 6.0, unit: '100g' },
  { name: '苦瓜', category: '蔬菜', calories: 18, protein: 1.0, fat: 0.2, carbs: 3.5, unit: '100g' },
  { name: '豆角', category: '蔬菜', calories: 34, protein: 2.5, fat: 0.2, carbs: 6.0, unit: '100g' },
  { name: '蘑菇', category: '蔬菜', calories: 20, protein: 3.0, fat: 0.1, carbs: 2.5, unit: '100g' },
  { name: '木耳', category: '蔬菜', calories: 21, protein: 1.5, fat: 0.2, carbs: 4.5, unit: '100g' },
  // 水果类
  { name: '苹果', category: '水果', calories: 54, protein: 0.3, fat: 0.2, carbs: 13.5, unit: '100g' },
  { name: '香蕉', category: '水果', calories: 93, protein: 1.4, fat: 0.2, carbs: 23.0, unit: '100g' },
  { name: '橙子', category: '水果', calories: 45, protein: 0.9, fat: 0.1, carbs: 11.0, unit: '100g' },
  { name: '葡萄', category: '水果', calories: 67, protein: 0.6, fat: 0.2, carbs: 17.0, unit: '100g' },
  { name: '西瓜', category: '水果', calories: 30, protein: 0.6, fat: 0.1, carbs: 7.6, unit: '100g' },
  { name: '草莓', category: '水果', calories: 30, protein: 0.7, fat: 0.3, carbs: 7.0, unit: '100g' },
  { name: '蓝莓', category: '水果', calories: 49, protein: 0.7, fat: 0.3, carbs: 12.0, unit: '100g' },
  { name: '猕猴桃', category: '水果', calories: 56, protein: 0.9, fat: 0.4, carbs: 13.0, unit: '100g' },
  { name: '芒果', category: '水果', calories: 65, protein: 0.9, fat: 0.3, carbs: 15.0, unit: '100g' },
  { name: '菠萝', category: '水果', calories: 44, protein: 0.5, fat: 0.1, carbs: 11.0, unit: '100g' },
  { name: '柚子', category: '水果', calories: 41, protein: 0.8, fat: 0.2, carbs: 9.5, unit: '100g' },
  { name: '梨', category: '水果', calories: 50, protein: 0.3, fat: 0.1, carbs: 13.0, unit: '100g' },
  { name: '桃子', category: '水果', calories: 42, protein: 0.9, fat: 0.1, carbs: 10.0, unit: '100g' },
  { name: '樱桃', category: '水果', calories: 63, protein: 1.1, fat: 0.2, carbs: 16.0, unit: '100g' },
  { name: '火龙果', category: '水果', calories: 51, protein: 1.1, fat: 0.2, carbs: 12.0, unit: '100g' },
  // 蛋奶类
  { name: '鸡蛋', category: '蛋奶', calories: 144, protein: 13.3, fat: 9.5, carbs: 1.5, unit: '100g' },
  { name: '鸭蛋', category: '蛋奶', calories: 180, protein: 12.6, fat: 13.0, carbs: 1.7, unit: '100g' },
  { name: '牛奶', category: '蛋奶', calories: 54, protein: 3.0, fat: 3.2, carbs: 3.4, unit: '100ml' },
  { name: '酸奶', category: '蛋奶', calories: 72, protein: 2.9, fat: 2.7, carbs: 9.3, unit: '100ml' },
  { name: '奶酪', category: '蛋奶', calories: 328, protein: 25.0, fat: 24.0, carbs: 1.0, unit: '100g' },
  { name: '豆浆', category: '蛋奶', calories: 33, protein: 2.9, fat: 1.2, carbs: 1.2, unit: '100ml' },
  { name: '豆腐', category: '蛋奶', calories: 81, protein: 8.0, fat: 3.7, carbs: 4.0, unit: '100g' },
  // 饮品类
  { name: '可乐', category: '饮品', calories: 42, protein: 0, fat: 0, carbs: 10.6, unit: '100ml' },
  { name: '雪碧', category: '饮品', calories: 41, protein: 0, fat: 0, carbs: 10.0, unit: '100ml' },
  { name: '橙汁', category: '饮品', calories: 45, protein: 0.7, fat: 0.2, carbs: 10.4, unit: '100ml' },
  { name: '奶茶', category: '饮品', calories: 60, protein: 0.5, fat: 2.0, carbs: 9.0, unit: '100ml' },
  { name: '咖啡', category: '饮品', calories: 1, protein: 0.1, fat: 0, carbs: 0, unit: '100ml' },
  { name: '啤酒', category: '饮品', calories: 32, protein: 0.3, fat: 0, carbs: 3.0, unit: '100ml' },
  { name: '白酒', category: '饮品', calories: 280, protein: 0, fat: 0, carbs: 0, unit: '100ml' },
  { name: '红酒', category: '饮品', calories: 75, protein: 0.1, fat: 0, carbs: 2.5, unit: '100ml' },
  { name: '绿茶', category: '饮品', calories: 1, protein: 0, fat: 0, carbs: 0.2, unit: '100ml' },
  { name: '王老吉', category: '饮品', calories: 40, protein: 0, fat: 0, carbs: 10.0, unit: '100ml' },
  // 零食甜点类
  { name: '薯片', category: '零食', calories: 548, protein: 6.0, fat: 37.0, carbs: 48.0, unit: '100g' },
  { name: '饼干', category: '零食', calories: 435, protein: 7.0, fat: 15.0, carbs: 68.0, unit: '100g' },
  { name: '巧克力', category: '零食', calories: 546, protein: 5.0, fat: 31.0, carbs: 59.0, unit: '100g' },
  { name: '冰淇淋', category: '零食', calories: 207, protein: 3.5, fat: 11.0, carbs: 24.0, unit: '100g' },
  { name: '蛋糕', category: '零食', calories: 348, protein: 6.0, fat: 15.0, carbs: 48.0, unit: '100g' },
  { name: '甜甜圈', category: '零食', calories: 452, protein: 5.0, fat: 25.0, carbs: 51.0, unit: '100g' },
  { name: '爆米花', category: '零食', calories: 387, protein: 13.0, fat: 4.0, carbs: 78.0, unit: '100g' },
  { name: '坚果', category: '零食', calories: 600, protein: 15.0, fat: 50.0, carbs: 20.0, unit: '100g' },
  { name: '瓜子', category: '零食', calories: 606, protein: 23.0, fat: 49.0, carbs: 18.0, unit: '100g' },
  { name: '糖果', category: '零食', calories: 400, protein: 0, fat: 0, carbs: 100.0, unit: '100g' },
  { name: '麻花', category: '零食', calories: 527, protein: 8.0, fat: 25.0, carbs: 67.0, unit: '100g' },
  // 汤类
  { name: '鸡汤', category: '汤', calories: 34, protein: 4.0, fat: 2.0, carbs: 0, unit: '100ml' },
  { name: '排骨汤', category: '汤', calories: 55, protein: 5.0, fat: 3.5, carbs: 0, unit: '100ml' },
  { name: '紫菜蛋花汤', category: '汤', calories: 20, protein: 2.0, fat: 0.8, carbs: 1.0, unit: '100ml' },
  { name: '西红柿蛋汤', category: '汤', calories: 28, protein: 2.0, fat: 1.5, carbs: 2.0, unit: '100ml' },
  // 家常菜类
  { name: '西红柿炒蛋', category: '家常', calories: 120, protein: 8.0, fat: 7.0, carbs: 8.0, unit: '100g' },
  { name: '麻婆豆腐', category: '家常', calories: 130, protein: 10.0, fat: 8.0, carbs: 6.0, unit: '100g' },
  { name: '尖椒干豆腐', category: '家常', calories: 140, protein: 12.0, fat: 8.0, carbs: 6.0, unit: '100g' },
  { name: '肉段', category: '家常', calories: 280, protein: 15.0, fat: 18.0, carbs: 15.0, unit: '100g' },
  { name: '锅包肉', category: '家常', calories: 320, protein: 18.0, fat: 22.0, carbs: 18.0, unit: '100g' },
  { name: '宫保鸡丁', category: '家常', calories: 197, protein: 18.0, fat: 10.0, carbs: 8.0, unit: '100g' },
  { name: '鱼香肉丝', category: '家常', calories: 183, protein: 15.0, fat: 10.0, carbs: 8.0, unit: '100g' },
  { name: '回锅肉', category: '家常', calories: 235, protein: 14.0, fat: 16.0, carbs: 5.0, unit: '100g' },
  { name: '糖醋里脊', category: '家常', calories: 226, protein: 17.0, fat: 10.0, carbs: 18.0, unit: '100g' },
  { name: '红烧肉', category: '家常', calories: 295, protein: 13.0, fat: 22.0, carbs: 8.0, unit: '100g' },
  { name: '酸辣土豆丝', category: '家常', calories: 108, protein: 2.5, fat: 5.0, carbs: 14.0, unit: '100g' },
  { name: '地三鲜', category: '家常', calories: 110, protein: 3.0, fat: 6.0, carbs: 12.0, unit: '100g' },
  { name: '红烧茄子', category: '家常', calories: 120, protein: 3.0, fat: 7.0, carbs: 12.0, unit: '100g' },
  { name: '红烧排骨', category: '家常', calories: 280, protein: 18.0, fat: 20.0, carbs: 8.0, unit: '100g' },
  { name: '红烧鱼', category: '家常', calories: 150, protein: 20.0, fat: 6.0, carbs: 5.0, unit: '100g' },
  { name: '清蒸鱼', category: '家常', calories: 110, protein: 22.0, fat: 2.0, carbs: 0, unit: '100g' },
  { name: '糖醋排骨', category: '家常', calories: 260, protein: 16.0, fat: 15.0, carbs: 18.0, unit: '100g' },
  { name: '京酱肉丝', category: '家常', calories: 210, protein: 16.0, fat: 12.0, carbs: 10.0, unit: '100g' },
  { name: '木须肉', category: '家常', calories: 160, protein: 14.0, fat: 8.0, carbs: 8.0, unit: '100g' },
  { name: '青椒肉丝', category: '家常', calories: 170, protein: 14.0, fat: 10.0, carbs: 6.0, unit: '100g' },
  { name: '蒜蓉粉丝蒸扇贝', category: '家常', calories: 130, protein: 15.0, fat: 4.0, carbs: 10.0, unit: '100g' },
  { name: '酸菜鱼', category: '家常', calories: 140, protein: 20.0, fat: 5.0, carbs: 5.0, unit: '100g' },
  { name: '水煮肉片', category: '家常', calories: 200, protein: 22.0, fat: 12.0, carbs: 3.0, unit: '100g' },
  { name: '毛血旺', category: '家常', calories: 180, protein: 18.0, fat: 10.0, carbs: 5.0, unit: '100g' },
  { name: '干煸四季豆', category: '家常', calories: 120, protein: 4.0, fat: 7.0, carbs: 12.0, unit: '100g' },
  { name: '虎皮尖椒', category: '家常', calories: 100, protein: 2.0, fat: 6.0, carbs: 10.0, unit: '100g' },
  { name: '干锅花菜', category: '家常', calories: 130, protein: 4.0, fat: 8.0, carbs: 12.0, unit: '100g' },
  { name: '干锅土豆片', category: '家常', calories: 150, protein: 3.0, fat: 9.0, carbs: 16.0, unit: '100g' },
  { name: '爆炒肝尖', category: '家常', calories: 140, protein: 18.0, fat: 6.0, carbs: 3.0, unit: '100g' },
  { name: '熘肉段', category: '家常', calories: 290, protein: 15.0, fat: 18.0, carbs: 18.0, unit: '100g' },
  { name: '木耳炒鸡蛋', category: '家常', calories: 130, protein: 9.0, fat: 8.0, carbs: 7.0, unit: '100g' },
  { name: '香菇青菜', category: '家常', calories: 70, protein: 3.0, fat: 4.0, carbs: 6.0, unit: '100g' },
  { name: '蚝油生菜', category: '家常', calories: 50, protein: 2.0, fat: 3.0, carbs: 4.0, unit: '100g' },
  { name: '上汤娃娃菜', category: '家常', calories: 45, protein: 2.0, fat: 2.5, carbs: 4.0, unit: '100g' },
  { name: '蒜蓉西兰花', category: '家常', calories: 60, protein: 3.0, fat: 3.0, carbs: 5.0, unit: '100g' },
  { name: '凉拌黄瓜', category: '家常', calories: 35, protein: 1.0, fat: 2.0, carbs: 3.0, unit: '100g' },
  { name: '凉拌西红柿', category: '家常', calories: 40, protein: 1.0, fat: 2.0, carbs: 5.0, unit: '100g' },
  { name: '皮蛋豆腐', category: '家常', calories: 120, protein: 10.0, fat: 8.0, carbs: 3.0, unit: '100g' },
  { name: '小葱拌豆腐', category: '家常', calories: 100, protein: 8.0, fat: 6.0, carbs: 4.0, unit: '100g' },
  { name: '大拌菜', category: '家常', calories: 45, protein: 2.0, fat: 2.0, carbs: 5.0, unit: '100g' },
  { name: '炒饭', category: '家常', calories: 180, protein: 5.0, fat: 6.0, carbs: 28.0, unit: '100g' },
  { name: '炒面', category: '家常', calories: 210, protein: 6.0, fat: 8.0, carbs: 30.0, unit: '100g' },
  { name: '炒饼', category: '家常', calories: 220, protein: 5.0, fat: 8.0, carbs: 34.0, unit: '100g' },
  { name: '炒河粉', category: '家常', calories: 200, protein: 4.0, fat: 7.0, carbs: 32.0, unit: '100g' },
  { name: '盖浇饭', category: '家常', calories: 200, protein: 7.0, fat: 7.0, carbs: 30.0, unit: '100g' },
  { name: '麻辣烫', category: '家常', calories: 150, protein: 8.0, fat: 8.0, carbs: 15.0, unit: '100g' },
  { name: '麻辣香锅', category: '家常', calories: 180, protein: 10.0, fat: 12.0, carbs: 12.0, unit: '100g' },
  { name: '火锅', category: '家常', calories: 180, protein: 15.0, fat: 12.0, carbs: 5.0, unit: '100g' },
  { name: '烤肉', category: '家常', calories: 250, protein: 25.0, fat: 15.0, carbs: 2.0, unit: '100g' },
  { name: '自助烤肉', category: '家常', calories: 300, protein: 25.0, fat: 20.0, carbs: 5.0, unit: '100g' },
  { name: '石锅拌饭', category: '家常', calories: 220, protein: 8.0, fat: 7.0, carbs: 35.0, unit: '100g' },
  { name: '蛋炒饭', category: '家常', calories: 190, protein: 6.0, fat: 7.0, carbs: 29.0, unit: '100g' },
  { name: '扬州炒饭', category: '家常', calories: 200, protein: 7.0, fat: 8.0, carbs: 28.0, unit: '100g' },
  // 日式
  { name: '刺身', category: '日式', calories: 80, protein: 18.0, fat: 1.0, carbs: 0, unit: '100g' },
  { name: '寿司', category: '日式', calories: 140, protein: 5.0, fat: 2.0, carbs: 26.0, unit: '100g' },
  { name: '拉面', category: '日式', calories: 350, protein: 12.0, fat: 14.0, carbs: 45.0, unit: '100g' },
  { name: '味噌汤', category: '日式', calories: 25, protein: 2.0, fat: 1.0, carbs: 2.0, unit: '100ml' },
  { name: '天妇罗', category: '日式', calories: 290, protein: 8.0, fat: 18.0, carbs: 26.0, unit: '100g' },
  // 烘焙类
  { name: '蛋挞', category: '烘焙', calories: 280, protein: 5.0, fat: 14.0, carbs: 35.0, unit: '100g' },
  { name: '泡芙', category: '烘焙', calories: 320, protein: 5.0, fat: 18.0, carbs: 36.0, unit: '100g' },
  { name: '曲奇', category: '烘焙', calories: 488, protein: 5.0, fat: 26.0, carbs: 58.0, unit: '100g' },
  // 其他
  { name: '火锅底料', category: '调料', calories: 90, protein: 2.0, fat: 7.0, carbs: 5.0, unit: '100g' },
  { name: '辣椒油', category: '调料', calories: 900, protein: 0, fat: 100.0, carbs: 0, unit: '100g' },
  { name: '芝麻酱', category: '调料', calories: 598, protein: 19.0, fat: 53.0, carbs: 15.0, unit: '100g' },
  { name: '番茄酱', category: '调料', calories: 112, protein: 1.5, fat: 0.3, carbs: 27.0, unit: '100g' },
]

// 分类健康建议
const HEALTH_ADVICE = {
  '主食': '建议粗细粮搭配，控制摄入量',
  '肉类': '适量摄入，建议选择瘦肉',
  '海鲜': '优质蛋白，建议每周2-3次',
  '蔬菜': '建议每餐都有，深色蔬菜更佳',
  '水果': '建议在两餐之间食用',
  '蛋奶': '优质蛋白来源，建议每天摄入',
  '饮品': '建议少喝含糖饮料',
  '零食': '建议少吃，多选择坚果水果',
  '汤': '饭前喝汤有助控制食量',
  '家常': '家常菜较为均衡，注意少油少盐',
  '日式': '清淡少油，注意摄入量',
  '烘焙': '高糖高脂，建议少吃',
  '调料': '注意用量，少油少盐',
}

// 计算健康评分
function calcHealthScore(category, calories, protein) {
  let score = 5
  if (category === '蔬菜' || category === '水果') score += 3
  else if (category === '海鲜' || category === '蛋奶') score += 2
  else if (category === '肉类' || category === '家常') score += 1
  else if (['快餐', '零食', '烘焙', '饮品'].includes(category)) score -= 2
  if (protein > 10) score += 1
  if (calories > 400) score -= 1
  if (calories > 600) score -= 2
  return Math.max(1, Math.min(10, score))
}

// 获取搭配建议
function getCombinationAdvice(foods) {
  const categories = foods.map(f => f.category)
  const hasMeat = categories.includes('肉类') || categories.includes('海鲜') || categories.includes('家常')
  const hasVeg = categories.includes('蔬菜') || categories.includes('家常')
  const hasCarb = categories.includes('主食')
  if (hasMeat && hasVeg && hasCarb) return '荤素搭配，营养均衡'
  if (!hasMeat && hasVeg) return '建议添加蛋白质食物'
  if (!hasVeg) return '建议搭配蔬菜更健康'
  if (!hasCarb) return '建议添加主食提供能量'
  return '注意控制总热量'
}

// ── Food Analysis Page ─────────────────────────────────────────────────
const WEIGHT_OPTIONS = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500]

function FoodPage({ data, save }) {
  const [search, setSearch] = useState('')
  const [selectedFood, setSelectedFood] = useState(null)
  const [selectedWeight, setSelectedWeight] = useState(100)
  const [showWeightSelect, setShowWeightSelect] = useState(false)

  const todayFoods = data.foodLog?.[todayStr()] || []
  const todayCalories = todayFoods.reduce((sum, f) => sum + (f.calories || 0), 0)

  // 搜索食物
  const filteredFoods = search.trim()
    ? FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : []

  // 选择食物后显示重量选择
  const selectFood = (food) => {
    setSelectedFood(food)
    setSelectedWeight(100)
    setShowWeightSelect(true)
  }

  // 计算选定重量的营养
  const calcNutrition = (food, weight) => {
    const ratio = weight / 100
    return {
      calories: Math.round(food.calories * ratio),
      protein: Math.round(food.protein * ratio * 10) / 10,
      fat: Math.round(food.fat * ratio * 10) / 10,
      carbs: Math.round(food.carbs * ratio * 10) / 10,
    }
  }

  // 确认添加
  const confirmAdd = () => {
    if (!selectedFood) return
    const today = todayStr()
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    const nutrition = calcNutrition(selectedFood, selectedWeight)
    const entry = {
      name: selectedFood.name,
      calories: nutrition.calories,
      protein: nutrition.protein,
      fat: nutrition.fat,
      carbs: nutrition.carbs,
      category: selectedFood.category,
      weight: selectedWeight,
      unit: selectedFood.unit,
      time: timeStr,
      healthScore: calcHealthScore(selectedFood.category, nutrition.calories, nutrition.protein),
    }
    save(d => ({
      ...d,
      foodLog: {
        ...(d.foodLog || {}),
        [today]: [...(d.foodLog?.[today] || []), entry]
      }
    }))
    setSelectedFood(null)
    setShowWeightSelect(false)
    setSearch('')
  }

  // 删除今日记录
  const deleteFood = (index) => {
    const today = todayStr()
    const newLog = [...(data.foodLog?.[today] || [])]
    newLog.splice(index, 1)
    save(d => ({
      ...d,
      foodLog: { ...(d.foodLog || {}), [today]: newLog }
    }))
  }

  const currentNutrition = selectedFood ? calcNutrition(selectedFood, selectedWeight) : null

  return (
    <div className="page active">
      <div className="food-header">
        <div className="food-title">食物热量</div>
        <div className="food-today-cal">{todayCalories} kcal</div>
      </div>

      <div className="food-search-box">
        <input
          type="text"
          className="food-search-input"
          placeholder="搜索食物..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {search.trim() && filteredFoods.length > 0 && (
        <div className="food-search-results">
          {filteredFoods.slice(0, 10).map((food, i) => (
            <div key={i} className="food-search-item" onClick={() => selectFood(food)}>
              <div className="food-search-name">{food.name}</div>
              <div className="food-search-info">{food.calories} kcal / {food.unit}</div>
            </div>
          ))}
        </div>
      )}

      {search.trim() && filteredFoods.length === 0 && (
        <div className="food-no-result">未找到相关食物</div>
      )}

      {showWeightSelect && selectedFood && (
        <div className="food-weight-modal">
          <div className="food-weight-box">
            <div className="food-weight-title">{selectedFood.name}</div>
            <div className="food-weight-base">基础: {selectedFood.calories} kcal / {selectedFood.unit}</div>
            <div className="food-weight-label">选择重量 (g)</div>
            <div className="food-weight-options">
              {WEIGHT_OPTIONS.map(w => (
                <button
                  key={w}
                  className={`food-weight-btn ${selectedWeight === w ? 'active' : ''}`}
                  onClick={() => setSelectedWeight(w)}
                >
                  {w}
                </button>
              ))}
            </div>
            <div className="food-weight-custom">
              <input
                type="number"
                className="food-weight-input"
                placeholder="自定义"
                value={selectedWeight}
                onChange={e => setSelectedWeight(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <span>g</span>
            </div>
            {currentNutrition && (
              <div className="food-weight-result">
                <div className="food-weight-cal">{currentNutrition.calories} kcal</div>
                <div className="food-weight-macros">
                  蛋白 {currentNutrition.protein}g | 脂肪 {currentNutrition.fat}g | 碳水 {currentNutrition.carbs}g
                </div>
              </div>
            )}
            <div className="food-weight-btns">
              <button className="food-weight-cancel" onClick={() => { setSelectedFood(null); setShowWeightSelect(false) }}>取消</button>
              <button className="food-weight-confirm" onClick={confirmAdd}>添加</button>
            </div>
          </div>
        </div>
      )}

      {todayFoods.length > 0 && !showWeightSelect && (
        <div className="food-today-summary">
          <div className="food-summary-title">今日饮食</div>
          <div className="food-summary-list">
            {todayFoods.map((f, i) => (
              <div key={i} className="food-summary-item">
                <div className="food-summary-left">
                  <span className="food-summary-name">{f.name}</span>
                  <span className="food-summary-time">{f.weight || 100}{f.unit} | {f.time}</span>
                </div>
                <div className="food-summary-right">
                  <span className="food-summary-cal">{f.calories} kcal</span>
                  <button className="food-delete-btn" onClick={() => deleteFood(i)}>×</button>
                </div>
              </div>
            ))}
          </div>
          <div className="food-summary-footer">
            共 {todayFoods.length} 项 | 总计 {todayCalories} kcal
          </div>
        </div>
      )}

      {!showWeightSelect && todayFoods.length === 0 && (
        <div className="food-empty">
          <div className="food-empty-icon">🍽️</div>
          <div>搜索上方食物添加记录</div>
        </div>
      )}
    </div>
  )
}

// ── Sports Page ─────────────────────────────────────────────────────
function SportsPage({ data, save }) {
  const [selectedSport, setSelectedSport] = useState(null)
  const [selectedDuration, setSelectedDuration] = useState(30)
  const [showDurSelect, setShowDurSelect] = useState(false)

  const todaySports = data.sportLog?.[todayStr()] || []
  const todayBurned = todaySports.reduce((sum, s) => sum + (s.calories || 0), 0)

  // 选择运动
  const selectSport = (sport) => {
    setSelectedSport(sport)
    setSelectedDuration(30)
    setShowDurSelect(true)
  }

  // 计算消耗能量
  const calcBurned = (sport, duration) => {
    return Math.round(sport.caloriesPerMin * duration)
  }

  // 确认添加
  const confirmAdd = () => {
    if (!selectedSport) return
    const today = todayStr()
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    const calories = calcBurned(selectedSport, selectedDuration)
    const entry = {
      id: selectedSport.id,
      name: selectedSport.name,
      icon: selectedSport.icon,
      category: selectedSport.category,
      duration: selectedDuration,
      calories: calories,
      time: timeStr,
    }
    save(d => ({
      ...d,
      sportLog: {
        ...(d.sportLog || {}),
        [today]: [...(d.sportLog?.[today] || []), entry]
      }
    }))
    setSelectedSport(null)
    setShowDurSelect(false)
  }

  // 删除今日记录
  const deleteSport = (index) => {
    const today = todayStr()
    const newLog = [...(data.sportLog?.[today] || [])]
    newLog.splice(index, 1)
    save(d => ({
      ...d,
      sportLog: { ...(d.sportLog || {}), [today]: newLog }
    }))
  }

  const currentBurned = selectedSport ? calcBurned(selectedSport, selectedDuration) : 0

  // 按分类分组运动
  const sportsByCategory = SPORTS_DATABASE.reduce((acc, sport) => {
    if (!acc[sport.category]) acc[sport.category] = []
    acc[sport.category].push(sport)
    return acc
  }, {})

  return (
    <div className="page active">
      <div className="sports-header">
        <div className="sports-title">运动消耗</div>
        <div className="sports-today-burn">{todayBurned} kcal</div>
      </div>

      <div className="sports-categories">
        {Object.entries(sportsByCategory).map(([category, sports]) => (
          <div key={category} className="sports-category">
            <div className="sports-category-title">{category}</div>
            <div className="sports-grid">
              {sports.map((sport) => (
                <div key={sport.id} className="sport-card" onClick={() => selectSport(sport)}>
                  <div className="sport-icon">{sport.icon}</div>
                  <div className="sport-name">{sport.name}</div>
                  <div className="sport-rate">{sport.caloriesPerMin} kcal/分</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showDurSelect && selectedSport && (
        <div className="sports-duration-modal">
          <div className="sports-duration-box">
            <div className="sports-duration-header">
              <div className="sports-duration-icon">{selectedSport.icon}</div>
              <div className="sports-duration-title">{selectedSport.name}</div>
              <div className="sports-duration-desc">{selectedSport.desc}</div>
            </div>
            <div className="sports-duration-rate">消耗: {selectedSport.caloriesPerMin} kcal/分钟</div>
            <div className="sports-duration-label">选择时长 (分钟)</div>
            <div className="sports-duration-options">
              {DURATION_OPTIONS.map(d => (
                <button
                  key={d}
                  className={`sports-duration-btn ${selectedDuration === d ? 'active' : ''}`}
                  onClick={() => setSelectedDuration(d)}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="sports-duration-custom">
              <input
                type="number"
                className="sports-duration-input"
                placeholder="自定义"
                value={selectedDuration}
                onChange={e => setSelectedDuration(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <span>分钟</span>
            </div>
            <div className="sports-duration-result">
              <div className="sports-duration-cal">{currentBurned} kcal</div>
              <div className="sports-duration-time">{selectedDuration} 分钟</div>
            </div>
            <div className="sports-duration-btns">
              <button className="sports-duration-cancel" onClick={() => { setSelectedSport(null); setShowDurSelect(false) }}>取消</button>
              <button className="sports-duration-confirm" onClick={confirmAdd}>添加</button>
            </div>
          </div>
        </div>
      )}

      {todaySports.length > 0 && !showDurSelect && (
        <div className="sports-today-summary">
          <div className="sports-summary-title">今日运动</div>
          <div className="sports-summary-list">
            {todaySports.map((s, i) => (
              <div key={i} className="sports-summary-item">
                <div className="sports-summary-left">
                  <span className="sports-summary-icon">{s.icon}</span>
                  <div className="sports-summary-info">
                    <span className="sports-summary-name">{s.name}</span>
                    <span className="sports-summary-time">{s.duration}分钟 | {s.time}</span>
                  </div>
                </div>
                <div className="sports-summary-right">
                  <span className="sports-summary-cal">-{s.calories} kcal</span>
                  <button className="sports-delete-btn" onClick={() => deleteSport(i)}>×</button>
                </div>
              </div>
            ))}
          </div>
          <div className="sports-summary-footer">
            共 {todaySports.length} 项 | 总计消耗 {todayBurned} kcal
          </div>
        </div>
      )}

      {!showDurSelect && todaySports.length === 0 && (
        <div className="sports-empty">
          <div className="sports-empty-icon">🏃</div>
          <div>点击上方运动项目添加记录</div>
        </div>
      )}
    </div>
  )
}

// ── Clean/Beauty Page ────────────────────────────────────────────────
function CleanPage({ data, save }) {
  const today = todayStr()
  const todayRecords = data.cleanLog?.[today] || {}

  // 各类别的今日次数
  const todayCounts = CLEAN_DATABASE.map(item => ({
    ...item,
    count: todayRecords[item.id] || 0
  }))

  // 今日清洁总分
  const todayScore = Object.values(todayRecords).reduce((sum, count) => sum + count, 0)

  // 打卡一次
  const addOne = (itemId) => {
    const today = todayStr()
    save(d => ({
      ...d,
      cleanLog: {
        ...(d.cleanLog || {}),
        [today]: {
          ...(d.cleanLog?.[today] || {}),
          [itemId]: (d.cleanLog?.[today]?.[itemId] || 0) + 1
        }
      }
    }))
  }

  // 删除一次
  const removeOne = (itemId) => {
    const today = todayStr()
    save(d => {
      const current = d.cleanLog?.[today]?.[itemId] || 0
      if (current <= 0) return d
      return {
        ...d,
        cleanLog: {
          ...(d.cleanLog || {}),
          [today]: {
            ...(d.cleanLog?.[today] || {}),
            [itemId]: current - 1
          }
        }
      }
    })
  }

  // 重置
  const resetDay = () => {
    save(d => ({
      ...d,
      cleanLog: {
        ...(d.cleanLog || {}),
        [today]: {}
      }
    }))
  }

  return (
    <div className="page active">
      <div className="clean-header">
        <div className="clean-title">清洁</div>
        <div className="clean-score">
          <span className="clean-score-num">{todayScore}</span>
          <span className="clean-score-label">分</span>
        </div>
      </div>

      <div className="clean-grid">
        {todayCounts.map((item) => (
          <div key={item.id} className="clean-card">
            <div className="clean-card-icon">{item.icon}</div>
            <div className="clean-card-name">{item.name}</div>
            <div className="clean-card-desc">{item.desc}</div>
            <div className="clean-card-count">
              <button className="clean-btn clean-btn-minus" onClick={() => removeOne(item.id)}>−</button>
              <span className="clean-count-num">{item.count}</span>
              <button className="clean-btn clean-btn-plus" onClick={() => addOne(item.id)}>+</button>
            </div>
          </div>
        ))}
      </div>

      {todayScore > 0 && (
        <div className="clean-reset">
          <button className="clean-reset-btn" onClick={resetDay}>重置今日</button>
        </div>
      )}

      <div className="clean-tip">
        <div className="clean-tip-title">每日清洁分</div>
        <div className="clean-tip-text">
          每完成一次清洁项目（发型、护肤、穿搭、化妆）加1分<br />
          点击 + 或 - 调整次数
        </div>
      </div>
    </div>
  )
}

// ── Lock Screen ──────────────────────────────────────────────────────
function LockScreen({ data, onUnlock }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const handleKey = (k) => {
    const next = pin + k
    setPin(next)
    setError(false)
    if (next.length === 4) {
      if (next === data.pin) onUnlock()
      else { setError(true); setPin('') }
    }
  }
  const handleBack = () => setPin('')

  return (
    <div className="lock-screen">
      <div className="lock-title">请输入 PIN</div>
      <div className="lock-dots">
        {[0,1,2,3].map(i => <div key={i} className={`lock-dot ${pin.length>i?'filled':''}`} />)}
      </div>
      {error && <div className="lock-error">密码错误</div>}
      <div className="pin-keypad">
        {[[1,2,3],[4,5,6],[7,8,9],[' ','0','⌫']].map((row, ri) =>
          row.map((k, ki) => {
            if (k === ' ') return <div key={`${ri}-${ki}`} className="pin-key empty" />
            return <div key={`${ri}-${ki}`} className="pin-key" onClick={() => k==='⌫' ? handleBack() : handleKey(String(k))}>{k}</div>
          })
        )}
      </div>
    </div>
  )
}

// ── PIN Setup ────────────────────────────────────────────────────────
function PinSetup({ onDone, onCancel }) {
  const [step, setStep] = useState(0)
  const [pin, setPin] = useState('')
  const [msg, setMsg] = useState('')

  const handleKey = (k) => {
    const next = pin + k
    setPin(next); setMsg('')
    if (next.length === 4) {
      if (step === 0) { setStep(1); setPin('') }
      else { onDone(next) }
    }
  }
  const handleBack = () => setPin('')

  return (
    <div className="lock-screen">
      <div className="lock-title">{step===0?'设置 PIN':'确认 PIN'}</div>
      <div className="lock-dots">
        {[0,1,2,3].map(i => <div key={i} className={`lock-dot ${pin.length>i?'filled':''}`} />)}
      </div>
      {msg && <div className="lock-error">{msg}</div>}
      <div className="pin-keypad">
        {[[1,2,3],[4,5,6],[7,8,9],[' ','0','⌫']].map((row, ri) =>
          row.map((k, ki) => {
            if (k === ' ') return <div key={`${ri}-${ki}`} className="pin-key empty" />
            return <div key={`${ri}-${ki}`} className="pin-key" onClick={() => k==='⌫' ? handleBack() : handleKey(String(k))}>{k}</div>
          })
        )}
      </div>
      <button className="lock-cancel" onClick={onCancel}>取消</button>
    </div>
  )
}

// ── Oath Modal ───────────────────────────────────────────────────────
function OathModal({ onConfirm }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-title">今日誓言</div>
        <div className="modal-body">
          此刻，我选择清净。<br />我为自己的身心负责。<br />我相信自己能守住这一日。
        </div>
        <button className="modal-btn" onClick={onConfirm}>确认誓言</button>
      </div>
    </div>
  )
}

// ── Home Page ────────────────────────────────────────────────────────
function HomePage({ data, todayChecked, onCheckin, showQuote }) {
  const streak = calcStreak(data.checked || {})
  const streakUnit = streak >= 30 ? '月' : streak >= 7 ? '周' : '天'
  const streakDisplay = streak >= 30 ? Math.floor(streak/30) : streak >= 7 ? Math.floor(streak/7) : streak
  const totalUrges = data.urges ? Object.values(data.urges).reduce((a, b) => a + b, 0) : 0

  return (
    <div className="page active">
      <div className="streak-display">
        <div className="streak-number">{streakDisplay}</div>
        <div className="streak-unit">{streakUnit}</div>
        <div className="streak-label">连续清净</div>
      </div>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-val">{totalUrges}</div>
          <div className="stat-lbl">冲动次数</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{data.checked ? Object.keys(data.checked).length : 0}</div>
          <div className="stat-lbl">总打卡天数</div>
        </div>
      </div>
      <div className="oath-section">
        <div className="oath-text">今日我选择清净<br />为自己负责 · 守住心念</div>
        <button className={`checkin-btn ${todayChecked ? 'checked' : ''}`} onClick={todayChecked ? null : onCheckin}>
          {todayChecked ? '✓ 今日已打卡' : '打卡'}
        </button>
      </div>
      {showQuote && <div className="quote">{randomQuote()}</div>}
    </div>
  )
}

// ── Timer Page ───────────────────────────────────────────────────────
function TimerPage({ data, save }) {
  const [preset, setPreset] = useState(15)
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(15 * 60)
  const [done, setDone] = useState(false)
  const [phase, setPhase] = useState('hold')
  const intervalRef = useRef(null)
  const totalRef = useRef(15 * 60)
  const startTimeRef = useRef(null)

  const start = () => {
    const total = preset * 60
    totalRef.current = total
    startTimeRef.current = Date.now()
    setRunning(true); setDone(false)
    setRemaining(total)
    setPhase('inhale')
    const today = todayStr()
    save(d => ({ ...d, urges: { ...(d.urges||{}), [today]: (d.urges||{})[today] + 1 || 1 } }))
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const newRem = Math.max(0, totalRef.current - elapsed)
      setRemaining(newRem)
      const cyclePos = elapsed % 12
      if (cyclePos < 4) setPhase('inhale')
      else if (cyclePos < 7) setPhase('hold')
      else setPhase('exhale')
      if (newRem <= 0) {
        clearInterval(intervalRef.current)
        setRunning(false); setDone(true); setPhase('done')
      }
    }, 200)
  }

  const cancel = () => {
    clearInterval(intervalRef.current)
    setRunning(false); setRemaining(preset*60); setPhase('hold')
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  if (done) return (
    <div className="page active">
      <div className="timer-page">
        <div className="timer-done"><h3>你度过了这次冲动</h3><p>欲望如浪，观其起落。<br />你选择了不被裹挟。</p></div>
        <div className="timer-controls"><button className="timer-btn" onClick={() => { setDone(false); setPhase('hold'); setRemaining(preset*60) }}>再来一次</button></div>
        <div className="quote" style={{marginTop:40}}>{randomQuote()}</div>
      </div>
    </div>
  )

  if (!running) return (
    <div className="page active">
      <div className="timer-page">
        <div className="timer-label">URGE SURFING</div>
        <div className="timer-presets">
          {[5,10,15,20,30].map(m => <button key={m} className={`preset-btn ${preset===m?'active':''}`} onClick={() => { setPreset(m); setRemaining(m*60) }}>{m}min</button>)}
        </div>
        <div className="breath-circle">
          <div className="timer-display">{fmt(remaining)}</div>
          <div className="timer-phase">就绪</div>
        </div>
        <div className="timer-controls"><button className="timer-btn" onClick={start}>开始</button></div>
      </div>
    </div>
  )

  return (
    <div className="page active">
      <div className="timer-page">
        <div className={`breath-circle ${phase}`}>
          <div className="timer-display">{fmt(remaining)}</div>
          <div className="timer-phase">{phase==='inhale'?'吸气':phase==='hold'?'屏息':'呼气'}</div>
        </div>
        <div className="timer-controls"><button className="timer-btn cancel" onClick={cancel}>取消</button></div>
      </div>
    </div>
  )
}

// ── Calendar Page ────────────────────────────────────────────────────
function CalendarPage({ data }) {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [selectedDay, setSelectedDay] = useState(null)
  const checked = data.checked || {}
  const urges = data.urges || {}
  const foodLog = data.foodLog || {}
  const sportLog = data.sportLog || {}
  const cleanLog = data.cleanLog || {}
  const today = todayStr()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const cells = []
  for (let i=0; i<firstDay; i++) cells.push(null)
  for (let d=1; d<=daysInMonth; d++) cells.push(d)

  const prev = () => month===0 ? (setYear(y=>y-1), setMonth(11)) : setMonth(m=>m-1)
  const next = () => month===11 ? (setYear(y=>y+1), setMonth(0)) : setMonth(m=>m+1)

  // 计算当月总营养、运动和清洁
  const monthTotals = cells.reduce((acc, day) => {
    if (!day) return acc
    const dayStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    const dayFoods = foodLog[dayStr] || []
    const daySports = sportLog[dayStr] || []
    const dayClean = cleanLog[dayStr] || {}
    const dayCleanScore = Object.values(dayClean).reduce((s, c) => s + c, 0)
    return {
      calories: acc.calories + dayFoods.reduce((s, f) => s + (f.calories || 0), 0),
      protein: acc.protein + dayFoods.reduce((s, f) => s + (f.protein || 0), 0),
      fat: acc.fat + dayFoods.reduce((s, f) => s + (f.fat || 0), 0),
      carbs: acc.carbs + dayFoods.reduce((s, f) => s + (f.carbs || 0), 0),
      burned: acc.burned + daySports.reduce((s, sp) => s + (sp.calories || 0), 0),
      cleanScore: acc.cleanScore + dayCleanScore,
    }
  }, { calories: 0, protein: 0, fat: 0, carbs: 0, burned: 0, cleanScore: 0 })

  // 选中日的详情
  const selectedDayStr = selectedDay ? `${year}-${String(month+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}` : null
  const selectedDayFoods = selectedDayStr ? (foodLog[selectedDayStr] || []) : []
  const selectedDaySports = selectedDayStr ? (sportLog[selectedDayStr] || []) : []
  const selectedDayClean = selectedDayStr ? (cleanLog[selectedDayStr] || {}) : {}
  const selectedDayTotals = selectedDayFoods.reduce((acc, f) => ({
    calories: acc.calories + (f.calories || 0),
    protein: acc.protein + (f.protein || 0),
    fat: acc.fat + (f.fat || 0),
    carbs: acc.carbs + (f.carbs || 0),
  }), { calories: 0, protein: 0, fat: 0, carbs: 0 })
  const selectedDayBurned = selectedDaySports.reduce((sum, s) => sum + (s.calories || 0), 0)
  const selectedDayCleanScore = Object.values(selectedDayClean).reduce((sum, c) => sum + c, 0)

  return (
    <div className="page active">
      <div className="calendar-header">
        <button className="cal-nav-btn" onClick={prev}>‹</button>
        <div className="cal-month">{year}年 {month+1}月</div>
        <button className="cal-nav-btn" onClick={next}>›</button>
      </div>
      <div className="calendar-grid">
        {['日','一','二','三','四','五','六'].map(d => <div key={d} className="cal-day-name">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} className="cal-day empty" />
          const dayStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const isChecked = !!checked[dayStr]
          const isToday = dayStr === today
          const isFuture = dayStr > today
          const isSelected = dayStr === selectedDayStr
          const dayUrges = urges[dayStr] || 0
          const dayFoods = foodLog[dayStr] || []
          const daySports = sportLog[dayStr] || []
          const dayClean = cleanLog[dayStr] || {}
          const dayCalories = dayFoods.reduce((sum, f) => sum + (f.calories || 0), 0)
          const dayBurned = daySports.reduce((sum, s) => sum + (s.calories || 0), 0)
          const dayCleanScore = Object.values(dayClean).reduce((sum, c) => sum + c, 0)
          const hasActivity = dayCalories > 0 || dayBurned > 0 || dayCleanScore > 0
          const cls = ['cal-day', isChecked?'checked':'', isToday&&!isChecked?'today':'', isFuture?'future':'', !isChecked&&!isToday&&!isFuture?'unchecked':'', isSelected?'selected':'', hasActivity&&!isChecked?'has-activity':''].filter(Boolean).join(' ')
          return (
            <div key={day} className={cls} onClick={() => setSelectedDay(isSelected ? null : day)}>
              <span className="cal-day-num">{day}</span>
              {dayCalories > 0 && <span className="cal-day-cal">{dayCalories}</span>}
              {dayBurned > 0 && <span className="cal-day-burn">↓{dayBurned}</span>}
              {dayCleanScore > 0 && <span className="cal-day-clean">✨{dayCleanScore}</span>}
              {dayUrges > 0 && <span className="cal-day-urges">{dayUrges}次</span>}
            </div>
          )
        })}
      </div>

      {/* 月度总览 */}
      {monthTotals.calories > 0 && (
        <div className="cal-month-totals">
          <div className="cal-total-item">
            <span className="cal-total-label">摄入</span>
            <span className="cal-total-val">{Math.round(monthTotals.calories)} kcal</span>
          </div>
          <div className="cal-total-item">
            <span className="cal-total-label">消耗</span>
            <span className="cal-total-val cal-total-burn">{Math.round(monthTotals.burned)} kcal</span>
          </div>
          <div className="cal-total-item">
            <span className="cal-total-label">差值</span>
            <span className={`cal-total-val ${monthTotals.calories - monthTotals.burned >= 0 ? 'cal-positive' : 'cal-negative'}`}>
              {monthTotals.calories - monthTotals.burned >= 0 ? '+' : ''}{Math.round(monthTotals.calories - monthTotals.burned)} kcal
            </span>
          </div>
          {monthTotals.cleanScore > 0 && (
            <div className="cal-total-item">
              <span className="cal-total-label">清洁</span>
              <span className="cal-total-val cal-total-clean">{monthTotals.cleanScore} 分</span>
            </div>
          )}
        </div>
      )}

      {/* 月度营养详情 */}
      {monthTotals.calories > 0 && (
        <div className="cal-month-nutrition">
          <div className="cal-nutrition-item">
            <span className="cal-nutrition-label">蛋白</span>
            <span className="cal-nutrition-val">{Math.round(monthTotals.protein)}g</span>
          </div>
          <div className="cal-nutrition-item">
            <span className="cal-nutrition-label">脂肪</span>
            <span className="cal-nutrition-val">{Math.round(monthTotals.fat)}g</span>
          </div>
          <div className="cal-nutrition-item">
            <span className="cal-nutrition-label">碳水</span>
            <span className="cal-nutrition-val">{Math.round(monthTotals.carbs)}g</span>
          </div>
        </div>
      )}

      {/* 选中日详情 */}
      {selectedDayStr && (
        <div className="cal-day-modal">
          <div className="cal-day-modal-overlay" onClick={() => setSelectedDay(null)} />
          <div className="cal-day-modal-box">
            <div className="cal-day-modal-header">
              <div className="cal-day-modal-title">{selectedDayStr}</div>
              <button className="cal-day-modal-close" onClick={() => setSelectedDay(null)}>×</button>
            </div>

            {/* 热量汇总 */}
            <div className="cal-day-modal-summary">
              <div className="cal-summary-item cal-summary-intake">
                <span className="cal-summary-icon">🍽️</span>
                <span className="cal-summary-label">摄入</span>
                <span className="cal-summary-val">{selectedDayTotals.calories}</span>
                <span className="cal-summary-unit">kcal</span>
              </div>
              <div className="cal-summary-item cal-summary-burn">
                <span className="cal-summary-icon">🏃</span>
                <span className="cal-summary-label">消耗</span>
                <span className="cal-summary-val">{selectedDayBurned}</span>
                <span className="cal-summary-unit">kcal</span>
              </div>
              <div className={`cal-summary-item cal-summary-diff ${selectedDayTotals.calories - selectedDayBurned >= 0 ? 'positive' : 'negative'}`}>
                <span className="cal-summary-icon">⚖️</span>
                <span className="cal-summary-label">差值</span>
                <span className="cal-summary-val">{selectedDayTotals.calories - selectedDayBurned >= 0 ? '+' : ''}{selectedDayTotals.calories - selectedDayBurned}</span>
                <span className="cal-summary-unit">kcal</span>
              </div>
            </div>

            {/* 清洁分 */}
            {selectedDayCleanScore > 0 && (
              <div className="cal-day-clean-score">
                <span className="cal-clean-icon">✨</span>
                <span className="cal-clean-label">清洁分</span>
                <span className="cal-clean-val">{selectedDayCleanScore}</span>
              </div>
            )}

            {/* 营养详情 */}
            {(selectedDayFoods.length > 0 || selectedDaySports.length > 0) && (
              <div className="cal-day-modal-macros">
                <div className="cal-macro-item">
                  <span className="cal-macro-label">蛋白质</span>
                  <span className="cal-macro-val">{Math.round(selectedDayTotals.protein * 10)/10}g</span>
                </div>
                <div className="cal-macro-item">
                  <span className="cal-macro-label">脂肪</span>
                  <span className="cal-macro-val">{Math.round(selectedDayTotals.fat * 10)/10}g</span>
                </div>
                <div className="cal-macro-item">
                  <span className="cal-macro-label">碳水</span>
                  <span className="cal-macro-val">{Math.round(selectedDayTotals.carbs * 10)/10}g</span>
                </div>
              </div>
            )}

            {/* 运动列表 */}
            {selectedDaySports.length > 0 && (
              <div className="cal-day-section">
                <div className="cal-section-title">🏃 运动记录</div>
                <div className="cal-day-modal-list">
                  {selectedDaySports.map((s, i) => (
                    <div key={i} className="cal-day-modal-item cal-sport-item">
                      <div className="cal-modal-item-left">
                        <span className="cal-modal-item-icon">{s.icon}</span>
                        <div>
                          <span className="cal-modal-item-name">{s.name}</span>
                          <span className="cal-modal-item-info">{s.duration}分钟</span>
                        </div>
                      </div>
                      <div className="cal-modal-item-right">
                        <span className="cal-modal-item-cal cal-sport-cal">-{s.calories} kcal</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 清洁列表 */}
            {Object.keys(selectedDayClean).length > 0 && (
              <div className="cal-day-section">
                <div className="cal-section-title">✨ 清洁记录</div>
                <div className="cal-day-modal-list">
                  {CLEAN_DATABASE.map(item => {
                    const count = selectedDayClean[item.id] || 0
                    if (count === 0) return null
                    return (
                      <div key={item.id} className="cal-day-modal-item cal-clean-item">
                        <div className="cal-modal-item-left">
                          <span className="cal-modal-item-icon">{item.icon}</span>
                          <span className="cal-modal-item-name">{item.name}</span>
                        </div>
                        <div className="cal-modal-item-right">
                          <span className="cal-clean-count">×{count}</span>
                          <span className="cal-clean-points">+{count}分</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 食物列表 */}
            {selectedDayFoods.length > 0 && (
              <div className="cal-day-section">
                <div className="cal-section-title">🍽️ 饮食记录</div>
                <div className="cal-day-modal-list">
                  {selectedDayFoods.map((f, i) => (
                    <div key={i} className="cal-day-modal-item">
                      <div className="cal-modal-item-left">
                        <span className="cal-modal-item-name">{f.name}</span>
                        <span className="cal-modal-item-info">{f.weight || 100}{f.unit}</span>
                      </div>
                      <div className="cal-modal-item-right">
                        <span className="cal-modal-item-cal">{f.calories} kcal</span>
                        <span className="cal-modal-item-macros">蛋白{f.protein}g 脂{f.fat}g 碳{f.carbs}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDayFoods.length === 0 && selectedDaySports.length === 0 && Object.keys(selectedDayClean).length === 0 && (
              <div className="cal-day-modal-empty">当日无记录</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Settings Page ────────────────────────────────────────────────────
function SettingsPage({ data, save, pinSet, setPinSet, setLocked }) {
  const [showSetup, setShowSetup] = useState(false)
  const handlePinToggle = () => {
    if (data.pin) {
      const { pin, ...rest } = data
      save(rest); setPinSet(false); setLocked(false)
    } else { setShowSetup(true) }
  }
  const handlePinDone = (newPin) => {
    save(d => ({ ...d, pin: newPin }))
    setPinSet(true); setShowSetup(false)
  }
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `jieshen_backup_${todayStr()}.json`; a.click()
    URL.revokeObjectURL(url)
  }
  const handleClear = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
      localStorage.removeItem(STORAGE_KEY)
      window.location.reload()
    }
  }

  if (showSetup) return <PinSetup onDone={handlePinDone} onCancel={() => setShowSetup(false)} />

  return (
    <div className="page active">
      <ul className="settings-list">
        <li className="settings-item">
          <div><div className="settings-label">PIN 密码锁</div><div className="settings-desc">启用后每次打开需输入 PIN</div></div>
          <button className={`toggle ${data.pin?'on':''}`} onClick={handlePinToggle} />
        </li>
        <li className="settings-item">
          <div><div className="settings-label">导出数据</div><div className="settings-desc">下载 JSON 格式备份</div></div>
          <button className="settings-export-btn" onClick={handleExport}>导出</button>
        </li>
      </ul>
      <div className="settings-danger">
        <button className="settings-danger-btn" onClick={handleClear}>清除所有数据</button>
      </div>
      <div className="quote" style={{marginTop:40}}>你的数据只存在本地设备。<br />我们无法恢复已删除的数据。</div>
    </div>
  )
}

// ── Tab Bar ──────────────────────────────────────────────────────────
function TabBar({ tab, setTab }) {
  return (
    <nav className="tab-bar">
      {[{id:'home',icon:'首'},{id:'timer',icon:'息'},{id:'food',icon:'食'},{id:'sport',icon:'动'},{id:'clean',icon:'净'},{id:'calendar',icon:'历'},{id:'settings',icon:'设'}].map(t => (
        <button key={t.id} className={`tab-btn ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>{t.icon}</button>
      ))}
    </nav>
  )
}

// ── App ──────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(loadData)
  const [tab, setTab] = useState('home')
  const [showOath, setShowOath] = useState(false)
  const [showQuote, setShowQuote] = useState(false)
  const [todayChecked, setTodayChecked] = useState(false)
  const [locked, setLocked] = useState(() => !!loadData().pin)
  const [pinSet, setPinSet] = useState(() => !!loadData().pin)

  const dataRef = useRef(data)
  dataRef.current = data

  const save = useCallback((upd) => {
    const next = typeof upd === 'function' ? upd(dataRef.current) : { ...dataRef.current, ...upd }
    setData(next); saveData(next)
  }, [])

  useEffect(() => {
    const lastVisit = data.lastVisit
    const today = todayStr()
    setTodayChecked(!!(data.checked && data.checked[today]))
    if (lastVisit !== today) {
      setShowOath(true)
      save(d => ({ ...d, lastVisit: today }))
    }
  }, [])

  const handleCheckin = () => {
    const today = todayStr()
    save(d => ({ ...d, checked: { ...(d.checked||{}), [today]: true } }))
    setTodayChecked(true)
    setShowQuote(true)
    setTimeout(() => setShowQuote(false), 4000)
  }

  if (pinSet && locked) return <LockScreen data={data} onUnlock={() => setLocked(false)} />

  const renderPage = () => {
    switch (tab) {
      case 'home': return <HomePage data={data} todayChecked={todayChecked} onCheckin={handleCheckin} showQuote={showQuote} />
      case 'timer': return <TimerPage data={data} save={save} />
      case 'food': return <FoodPage data={data} save={save} />
      case 'sport': return <SportsPage data={data} save={save} />
      case 'clean': return <CleanPage data={data} save={save} />
      case 'calendar': return <CalendarPage data={data} />
      case 'settings': return <SettingsPage data={data} save={save} pinSet={pinSet} setPinSet={setPinSet} setLocked={setLocked} />
      default: return <HomePage data={data} todayChecked={todayChecked} onCheckin={handleCheckin} showQuote={showQuote} />
    }
  }

  return (
    <>
      {showOath && <OathModal onConfirm={() => setShowOath(false)} />}
      {renderPage()}
      <TabBar tab={tab} setTab={setTab} />
    </>
  )
}
