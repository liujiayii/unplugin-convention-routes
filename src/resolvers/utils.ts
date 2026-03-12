/**
 * Resolver 公共工具函数模块
 * 提供 glob 模式转换、正则表达式转义等功能
 */

/**
 * 正则表达式特殊字符匹配模式
 * 移到模块作用域以避免每次调用重新编译
 */
export const ESCAPE_REGEXP = /[.*+?^${}()|[\]\\/:]/g

/**
 * glob 模式转换用的正则表达式
 * 移到模块作用域以避免每次调用重新编译
 */
export const GLOB_DOUBLE_STAR_RE = /\*\*/g
export const GLOB_SINGLE_STAR_RE = /\*/g
export const GLOB_QUESTION_RE = /\?/g
export const GLOB_DOT_RE = /\./g
export const GLOB_SLASH_RE = /\//g

/**
 * 占位符替换用的正则表达式
 * 移到模块作用域以避免每次调用重新编译
 */
const PLACEHOLDER_DOUBLE_STAR_RE = /<<<DOUBLE_STAR>>>/g
const PLACEHOLDER_SINGLE_STAR_RE = /<<<SINGLE_STAR>>>/g
const PLACEHOLDER_QUESTION_RE = /<<<QUESTION>>>/g

/**
 * 反斜杠匹配正则表达式
 * 用于转义正则表达式字符串中的反斜杠
 */
const BACKSLASH_RE = /\\/g

/**
 * 转义正则表达式中的特殊字符
 * 包括 Windows 路径中的特殊字符（如 / 和 :）
 * @param str - 待转义的字符串
 * @returns 转义后的字符串
 */
export function escapeRegExp(str: string): string {
  return str.replace(ESCAPE_REGEXP, "\\$&")
}

/**
 * 将 glob 模式转换为正则表达式字符串
 * 支持 **、*、? 等基本 glob 语法
 *
 * 转换顺序很重要：
 * 1. 先用占位符替换 glob 通配符，避免后续转义影响
 * 2. 转义字面字符（.）
 * 3. 将占位符替换为正则表达式
 *
 * 注意：/ 不需要转义，因为在 new RegExp() 中 / 不是特殊字符
 *
 * @param pattern - glob 模式
 * @returns 正则表达式字符串
 */
export function globToRegExp(pattern: string): string {
  return pattern
    // 先用占位符替换 glob 通配符，避免后续转义影响
    .replace(GLOB_DOUBLE_STAR_RE, "<<<DOUBLE_STAR>>>")
    .replace(GLOB_SINGLE_STAR_RE, "<<<SINGLE_STAR>>>")
    .replace(GLOB_QUESTION_RE, "<<<QUESTION>>>")
    // 转义字面字符（.）
    // 注意：/ 不需要转义，因为在 new RegExp() 中 / 不是特殊字符
    .replace(GLOB_DOT_RE, "\\.")
    // 将占位符替换为正则表达式
    .replace(PLACEHOLDER_DOUBLE_STAR_RE, ".*")
    .replace(PLACEHOLDER_SINGLE_STAR_RE, "[^/]*")
    .replace(PLACEHOLDER_QUESTION_RE, "[^/]")
}

/**
 * 转义正则表达式字符串中的反斜杠
 * 用于生成 new RegExp() 的字符串参数
 * 因为在字符串字面量中，\ 需要双重转义才能表示正则中的 \
 * @param str - 正则表达式字符串
 * @returns 转义后的字符串
 */
function escapeRegexString(str: string): string {
  return str.replace(BACKSLASH_RE, "\\\\")
}

/**
 * 生成 exclude 过滤代码
 * @param exclude - 排除模式数组
 * @param pathVarName - 路径变量名，Vite 用 'path'，Rspack 用 'key'
 * @returns 过滤代码字符串
 */
export function generateExcludeFilter(exclude: string[], pathVarName: string = "path"): string {
  if (!exclude || exclude.length === 0) {
    return ""
  }

  // 将 glob 模式转换为正则表达式字符串，并转义反斜杠以便在 new RegExp() 中使用
  const patterns = exclude.map(p => escapeRegexString(globToRegExp(p)))
  return `
  // 检查是否匹配排除模式
  const excludePatterns = [${patterns.map(p => `new RegExp('${p}')`).join(", ")}]
  const shouldExclude = excludePatterns.some(pattern => pattern.test(${pathVarName}))
  if (shouldExclude) return
`
}
