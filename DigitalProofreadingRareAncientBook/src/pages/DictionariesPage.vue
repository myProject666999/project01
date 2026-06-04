<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-serif text-ink-900 mb-2">字典管理</h1>
        <p class="text-ink-500">管理异体字、繁简对照字典</p>
      </div>
    </div>

    <div class="flex gap-8">
      <div class="w-64">
        <div class="bg-white rounded-lg border border-ink-200 overflow-hidden">
          <div class="px-4 py-3 border-b border-ink-200 bg-ink-50">
            <span class="text-sm font-medium text-ink-700">字典列表</span>
          </div>
          <div class="divide-y divide-ink-100">
            <div
              v-for="dict in dictionaries"
              :key="dict.id"
              class="px-4 py-3 cursor-pointer transition-colors"
              :class="selectedDictId === dict.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-ink-50'"
              @click="selectDict(dict)"
            >
              <div class="font-serif">{{ dict.name }}</div>
              <div class="text-xs text-ink-500 mt-1">{{ dict.entryCount }} 个词条</div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1">
        <div v-if="selectedDict" class="bg-white rounded-lg border border-ink-200">
          <div class="px-6 py-4 border-b border-ink-200 flex items-center justify-between">
            <div>
              <h2 class="font-serif text-lg text-ink-900">{{ selectedDict.name }}</h2>
              <p class="text-sm text-ink-500">{{ selectedDict.description }}</p>
            </div>
            <div class="flex items-center gap-3">
              <input
                v-model="searchQuery"
                placeholder="搜索字..."
                class="px-3 py-2 border border-ink-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                @input="handleSearch"
              />
              <button
                v-if="isAdmin"
                @click="showAddModal = true"
                class="px-3 py-2 text-sm bg-vermilion-500 hover:bg-vermilion-600 text-white rounded flex items-center gap-1"
              >
                <Plus class="w-4 h-4" />
                新增词条
              </button>
            </div>
          </div>

          <div class="max-h-96 overflow-auto">
            <table class="w-full">
              <thead class="bg-ink-50 sticky top-0">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider w-24">标准字</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider w-24">异体字</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider">备注</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-ink-500 uppercase tracking-wider w-24">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-ink-100">
                <tr v-for="entry in entries" :key="entry.id" class="hover:bg-ink-50">
                  <td class="px-6 py-4">
                    <span class="text-2xl font-serif">{{ entry.standardChar }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-2xl font-serif text-vermilion-500">{{ entry.variantChar }}</span>
                  </td>
                  <td class="px-6 py-4 text-sm text-ink-500">{{ entry.note || '-' }}</td>
                  <td class="px-6 py-4 text-right">
                    <button
                      v-if="isAdmin"
                      @click="deleteEntry(entry.id)"
                      class="text-ink-400 hover:text-vermilion-500"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                <tr v-if="entries.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-ink-400">暂无词条</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else class="bg-white rounded-lg border border-ink-200 p-12 text-center text-ink-400">
          请从左侧选择一个字典
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-serif text-ink-900 mb-4">新增词条</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-ink-600 mb-1">标准字</label>
            <input
              v-model="newEntry.standardChar"
              class="w-full px-3 py-2 border border-ink-300 rounded focus:outline-none focus:ring-2 focus:ring-vermilion-500 text-xl font-serif"
              maxlength="5"
            />
          </div>
          <div>
            <label class="block text-sm text-ink-600 mb-1">异体字/对应字</label>
            <input
              v-model="newEntry.variantChar"
              class="w-full px-3 py-2 border border-ink-300 rounded focus:outline-none focus:ring-2 focus:ring-vermilion-500 text-xl font-serif"
              maxlength="5"
            />
          </div>
          <div>
            <label class="block text-sm text-ink-600 mb-1">备注</label>
            <input
              v-model="newEntry.note"
              class="w-full px-3 py-2 border border-ink-300 rounded focus:outline-none focus:ring-2 focus:ring-vermilion-500"
            />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showAddModal = false" class="px-4 py-2 text-ink-600 hover:bg-ink-100 rounded">取消</button>
          <button @click="addEntry" class="px-4 py-2 bg-vermilion-500 hover:bg-vermilion-600 text-white rounded">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { getDictionaries, getDictionaryEntries, addDictionaryEntry, deleteDictionaryEntry } from '@/composables/useApi'

const { isAdmin } = useAuth()

const dictionaries = ref<any[]>([])
const selectedDictId = ref<number | null>(null)
const selectedDict = ref<any>(null)
const entries = ref<any[]>([])
const searchQuery = ref('')
const showAddModal = ref(false)
const newEntry = ref({
  standardChar: '',
  variantChar: '',
  note: '',
})

async function loadDictionaries() {
  const result = await getDictionaries()
  if (result.success) {
    dictionaries.value = result.data
    if (dictionaries.value.length > 0 && !selectedDictId.value) {
      selectDict(dictionaries.value[0])
    }
  }
}

async function selectDict(dict: any) {
  selectedDictId.value = dict.id
  selectedDict.value = dict
  await loadEntries()
}

async function loadEntries() {
  if (!selectedDictId.value) return
  const result = await getDictionaryEntries(String(selectedDictId.value), searchQuery.value)
  if (result.success) {
    entries.value = result.data
  }
}

function handleSearch() {
  loadEntries()
}

async function addEntry() {
  if (!selectedDictId.value || !newEntry.value.standardChar || !newEntry.value.variantChar) return
  
  const result = await addDictionaryEntry(String(selectedDictId.value), newEntry.value)
  if (result.success) {
    newEntry.value = { standardChar: '', variantChar: '', note: '' }
    showAddModal.value = false
    await loadEntries()
    await loadDictionaries()
  } else {
    alert(result.error)
  }
}

async function deleteEntry(entryId: number) {
  if (!selectedDictId.value || !confirm('确定删除该词条？')) return
  
  const result = await deleteDictionaryEntry(String(selectedDictId.value), String(entryId))
  if (result.success) {
    await loadEntries()
    await loadDictionaries()
  }
}

onMounted(loadDictionaries)
</script>
