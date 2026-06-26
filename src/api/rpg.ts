/**
 * RPG 接口（对齐 blog-home-nuxt/api/rpg.ts）
 */
import { http } from '@/http/http'
import {
  afterRpgMutation,
  afterRpgMutationWithPrefixes,
  rpgDedupedGet,
} from '@/api/rpg-inflight'
import type { BanStatus, RpgStatus, SignInfo, SignInResult } from '@/types/rpg'

const CORE_STATUS_KEYS = ['status', 'sign-info', 'ban-status', 'lottery/tickets'] as const

export function rpgSignIn() {
  return afterRpgMutation([...CORE_STATUS_KEYS, 'my-quests'], () =>
    http.post<SignInResult>('/rpg/sign'))
}

export function getRpgSignInfo() {
  return rpgDedupedGet('sign-info', () => http.get<SignInfo>('/rpg/sign-info'))
}

export function getRpgStatus() {
  return rpgDedupedGet('status', () => http.get<RpgStatus>('/rpg/status'))
}

export function getRpgHitRecords(page = 1, pageSize = 10) {
  return rpgDedupedGet(`hit-records:${page}:${pageSize}`, () =>
    http.get('/rpg/hit-records', { page, pageSize }))
}

export function getRpgLevelRewards() {
  return rpgDedupedGet('level-rewards', () => http.get('/rpg/level-rewards'))
}

export function getRpgLeaderboard(
  type: 'exp' | 'signDays' | 'level' | 'reputation' | 'currency' = 'exp',
  limit = 10,
  period: 'total' | 'week' | 'month' | 'season' = 'total',
) {
  return rpgDedupedGet(`leaderboard:${type}:${limit}:${period}`, () =>
    http.get('/rpg/leaderboard', { type, limit, period }))
}

export function getRpgBanStatus() {
  return rpgDedupedGet('ban-status', () => http.get<BanStatus>('/rpg/ban-status'))
}

export function getMyAchievements() {
  return rpgDedupedGet('my-achievements', () => http.get('/rpg/my-achievements'))
}

export function getMyQuests() {
  return rpgDedupedGet('my-quests', () => http.get('/rpg/my-quests'))
}

export function claimQuestReward(questCode: string) {
  return afterRpgMutation(['my-quests', 'status'], () =>
    http.post('/rpg/quest/claim', { questCode }))
}

export function getMyBuffs() {
  return rpgDedupedGet('my-buffs', () => http.get('/rpg/my-buffs'))
}

export function getLotteryPool() {
  return rpgDedupedGet('lottery/pool', () => http.get('/rpg/lottery/pool'))
}

export function lotteryDraw(count = 1, currency: 'ticket' | 'currency' = 'ticket') {
  return afterRpgMutationWithPrefixes([...CORE_STATUS_KEYS, 'my-buffs', 'loadout'], ['inventory:'], () =>
    http.post('/rpg/lottery/draw', { count, currency }))
}

export function getLotteryHistory(page = 1, pageSize = 20) {
  return rpgDedupedGet(`lottery/history:${page}:${pageSize}`, () =>
    http.get('/rpg/lottery/history', { page, pageSize }))
}

export function getLotteryTickets() {
  return rpgDedupedGet('lottery/tickets', () => http.get('/rpg/lottery/tickets'))
}

export function getRpgInventory(itemType?: string) {
  return rpgDedupedGet(`inventory:${itemType ?? ''}`, () =>
    http.get('/rpg/inventory', itemType ? { itemType } : {}))
}

export function getRpgLoadout() {
  return rpgDedupedGet('loadout', () => http.get('/rpg/loadout'))
}

export function equipLoadout(data: { slot: string, itemCode?: string, petId?: number }) {
  return afterRpgMutationWithPrefixes(['loadout', 'status'], ['inventory:'], () =>
    http.post('/rpg/loadout/equip', data))
}

export function unequipLoadout(slot: string) {
  return afterRpgMutationWithPrefixes(['loadout', 'status'], ['inventory:'], () =>
    http.post('/rpg/loadout/unequip', { slot }))
}

export function getMyPets() {
  return rpgDedupedGet('pets', () => http.get('/rpg/pets'))
}

export function getPetCatalog() {
  return rpgDedupedGet('pets/catalog', () => http.get('/rpg/pets/catalog'))
}

export function summonPet(itemCode: string) {
  return afterRpgMutationWithPrefixes(['pets', 'loadout'], ['inventory:'], () =>
    http.post('/rpg/pets/summon', { itemCode }))
}

export function exchangePet(petCode: string) {
  return afterRpgMutation(['pets', 'status'], () => http.post('/rpg/pets/exchange', { petCode }))
}

export function renamePet(id: number, nickname: string) {
  return afterRpgMutation(['pets'], () => http.patch(`/rpg/pets/${id}/rename`, { nickname }))
}

export function getCurrentActivity() {
  return rpgDedupedGet('activities/current', () => http.get('/rpg/activities/current'))
}

export function getWeatherBuff(city?: string) {
  return rpgDedupedGet(`weather-buff:${city ?? ''}`, () => http.get('/rpg/weather-buff', { city }))
}

export function getMyGuild() {
  return rpgDedupedGet('guild/my', () => http.get('/rpg/guild/my'))
}

export function listGuilds(page = 1, keyword?: string) {
  return rpgDedupedGet(`guilds:${page}:${keyword ?? ''}`, () =>
    http.get('/rpg/guilds', { page, pageSize: 20, keyword }))
}

export function createGuild(name: string, announcement?: string) {
  return afterRpgMutationWithPrefixes(['guild/my'], ['guilds:'], () =>
    http.post('/rpg/guild/create', { name, announcement }))
}

export function joinGuild(guildId: number) {
  return afterRpgMutationWithPrefixes(['guild/my'], ['guilds:'], () =>
    http.post('/rpg/guild/join', { guildId }))
}

export function leaveGuild() {
  return afterRpgMutationWithPrefixes(['guild/my'], ['guilds:'], () => http.post('/rpg/guild/leave'))
}

export function tipArticle(articleId: number, amount: number) {
  return afterRpgMutation(['status'], () => http.post('/rpg/article/tip', { articleId, amount }))
}

export function socialCheer(targetUid: number) {
  return afterRpgMutation(['status'], () => http.post('/rpg/social/cheer', { targetUid }))
}

export function socialEgg(targetUid: number) {
  return afterRpgMutation(['status'], () => http.post('/rpg/social/egg', { targetUid }))
}

export function socialFlower(targetUid: number) {
  return afterRpgMutation(['status'], () => http.post('/rpg/social/flower', { targetUid }))
}

export function activateBuff(id: number) {
  return afterRpgMutation(['my-buffs'], () => http.post(`/rpg/buff/${id}/activate`))
}

export function deactivateBuff(id: number) {
  return afterRpgMutation(['my-buffs'], () => http.post(`/rpg/buff/${id}/deactivate`))
}
