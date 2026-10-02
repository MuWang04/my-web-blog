/**
 * 判断链接是否为站外的 http(s) 地址。
 * 仅这类链接需要 target="_blank" + rel="noopener noreferrer"；
 * mailto:/tel: 以及站内路由不新开标签。
 */
export const isExternal = (url: string): boolean => /^https?:\/\//i.test(url)
