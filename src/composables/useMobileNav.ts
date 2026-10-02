import { ref } from 'vue'

/**
 * 移动端侧边抽屉导航的全局开关。
 * 顶栏汉堡按钮与侧边栏抽屉共享此状态；桌面端（>=1200px）不使用。
 */
export const mobileNavOpen = ref(false)

export const openMobileNav = () => {
  mobileNavOpen.value = true
}

export const closeMobileNav = () => {
  mobileNavOpen.value = false
}

export const toggleMobileNav = () => {
  mobileNavOpen.value = !mobileNavOpen.value
}
