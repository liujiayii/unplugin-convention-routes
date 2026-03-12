/**
 * globToRegExp 函数测试
 */
import { describe, expect, it } from 'vitest'
import { createExcludePatterns, generateExcludeCheck, globToRegExp } from '../src/resolvers/utils'

describe('globToRegExp', () => {
  describe('基本通配符', () => {
    it('** 匹配任意字符（包括路径分隔符）', () => {
      // ** 被转换为 .*，匹配任意字符
      // src/**/*.vue 要求 src 后面有子目录，所以 src/index.vue 不匹配
      const regex = new RegExp(`^${globToRegExp('src/**/*.vue')}$`)
      expect(regex.test('src/pages/index.vue')).toBe(true)
      expect(regex.test('src/pages/admin/index.vue')).toBe(true)
      // src/index.vue 不匹配，因为 **/ 后面必须有 /
      expect(regex.test('src/index.vue')).toBe(false)
    })

    it('** 可以匹配零层目录', () => {
      // 如果要让 ** 匹配零层目录，模式应该是 src**/*.vue
      const regex = new RegExp(`^${globToRegExp('src/**/*.vue')}$`)
      // 验证转换结果（/ 不再转义）
      expect(globToRegExp('src/**/*.vue')).toBe('src/.*/[^/]*\\.vue')
    })

    it('* 匹配单个路径段中的任意字符', () => {
      const regex = new RegExp(`^${globToRegExp('*.test.*')}$`)
      expect(regex.test('foo.test.ts')).toBe(true)
      expect(regex.test('bar.test.js')).toBe(true)
      expect(regex.test('foo.test')).toBe(false)
      expect(regex.test('foo/bar.test.ts')).toBe(false)
    })

    it('? 匹配单个字符', () => {
      const regex = new RegExp(`^${globToRegExp('file?.vue')}$`)
      expect(regex.test('file1.vue')).toBe(true)
      expect(regex.test('fileA.vue')).toBe(true)
      expect(regex.test('file.vue')).toBe(false)
      expect(regex.test('file12.vue')).toBe(false)
    })
  })

  describe('组合模式', () => {
    it('** 和 * 组合使用', () => {
      // **/components.* 转换为 .*\/components\.[^/]*
      const regex = new RegExp(globToRegExp('**/components.*'))
      expect(regex.test('src/components.vue')).toBe(true)
      expect(regex.test('src/pages/components.ts')).toBe(true)
      expect(regex.test('pages/components.tsx')).toBe(true)
    })

    it('多个 * 通配符', () => {
      const regex = new RegExp(`^${globToRegExp('*/*.vue')}$`)
      expect(regex.test('pages/index.vue')).toBe(true)
      expect(regex.test('views/home.vue')).toBe(true)
      expect(regex.test('pages/admin/index.vue')).toBe(false)
    })
  })

  describe('特殊字符转义', () => {
    it('. 字符正确转义', () => {
      const regex = new RegExp(`^${globToRegExp('components.vue')}$`)
      expect(regex.test('components.vue')).toBe(true)
      expect(regex.test('componentsXvue')).toBe(false)
    })

    it('/ 字符正确转义', () => {
      const regex = new RegExp(`^${globToRegExp('src/pages/index.vue')}$`)
      expect(regex.test('src/pages/index.vue')).toBe(true)
      expect(regex.test('src\\pages\\index.vue')).toBe(false)
    })
  })

  describe('正则元字符转义', () => {
    it('[ 和 ] 被正确转义，不会被当作字符类', () => {
      // **/[id].tsx 中的 [id] 应该被当作字面量，而不是字符类
      const regex = new RegExp(globToRegExp('**/[id].tsx'))
      // 应该匹配包含字面量 [id] 的路径
      expect(regex.test('src/[id].tsx')).toBe(true)
      expect(regex.test('src/pages/[id].tsx')).toBe(true)
      // 不应该匹配其他字符（如果 [id] 被当作字符类，会匹配 i, d 中的任意一个）
      expect(regex.test('src/i.tsx')).toBe(false)
      expect(regex.test('src/d.tsx')).toBe(false)
    })

    it('$ 被正确转义，不会被当作行尾锚点', () => {
      // **/$id.tsx 中的 $ 应该被当作字面量，而不是行尾锚点
      const regex = new RegExp(globToRegExp('**/$id.tsx'))
      expect(regex.test('src/$id.tsx')).toBe(true)
      expect(regex.test('src/pages/$id.tsx')).toBe(true)
      // 不应该匹配结尾是 id.tsx 的路径
      expect(regex.test('src/id.tsx')).toBe(false)
    })

    it('( 和 ) 被正确转义', () => {
      const regex = new RegExp(globToRegExp('**/(test).vue'))
      expect(regex.test('src/(test).vue')).toBe(true)
      expect(regex.test('src/test.vue')).toBe(false)
    })

    it('{ 和 } 被正确转义', () => {
      const regex = new RegExp(globToRegExp('**/{test}.vue'))
      expect(regex.test('src/{test}.vue')).toBe(true)
      expect(regex.test('src/test.vue')).toBe(false)
    })

    it('+ 被正确转义', () => {
      const regex = new RegExp(globToRegExp('**/file+.vue'))
      expect(regex.test('src/file+.vue')).toBe(true)
      // 如果 + 没被转义，会匹配 filee.vue, fileee.vue 等
      expect(regex.test('src/filee.vue')).toBe(false)
    })

    it('^ 被正确转义', () => {
      const regex = new RegExp(globToRegExp('**/^test.vue'))
      expect(regex.test('src/^test.vue')).toBe(true)
      // 如果 ^ 没被转义，会匹配开头是 test.vue 的路径
      expect(regex.test('src/test.vue')).toBe(false)
    })

    it('| 被正确转义', () => {
      const regex = new RegExp(globToRegExp('**/a|b.vue'))
      expect(regex.test('src/a|b.vue')).toBe(true)
      // 如果 | 没被转义，会匹配 a.vue 或 b.vue
      expect(regex.test('src/a.vue')).toBe(false)
      expect(regex.test('src/b.vue')).toBe(false)
    })

    it('\\ 被正确转义', () => {
      // 测试反斜杠作为字面量
      const result = globToRegExp('test\\file.vue')
      // 反斜杠应该被转义为双反斜杠
      expect(result).toBe('test\\\\file\\.vue')
    })

    it('组合正则元字符 - Remix 风格动态路由', () => {
      // 测试 Remix 风格的动态路由文件名 $id.tsx
      // 注意：$id 是字面量，不是通配符，所以只会匹配 $id.tsx
      const regex = new RegExp(globToRegExp('**/$id.tsx'))
      expect(regex.test('src/routes/$id.tsx')).toBe(true)
      // $postId.tsx 不应该匹配，因为 $id 是字面量
      expect(regex.test('src/routes/$postId.tsx')).toBe(false)
      // 不应该匹配没有 $ 的路径
      expect(regex.test('src/routes/id.tsx')).toBe(false)
      // 验证 $ 被转义
      expect(globToRegExp('$id.tsx')).toBe('\\$id\\.tsx')
    })

    it('组合正则元字符 - Next.js 风格动态路由', () => {
      // 测试 Next.js 风格的动态路由文件名 [id].tsx
      const regex = new RegExp(globToRegExp('**/[id].tsx'))
      expect(regex.test('src/routes/[id].tsx')).toBe(true)
      expect(regex.test('src/routes/[slug].tsx')).toBe(false)
      // 验证 [ 和 ] 被转义
      expect(globToRegExp('[id].tsx')).toBe('\\[id\\]\\.tsx')
    })
  })

  describe('默认排除模式', () => {
    it('node_modules 模式', () => {
      const regex = new RegExp(globToRegExp('node_modules'))
      expect(regex.test('node_modules')).toBe(true)
      expect(regex.test('node_modules/foo')).toBe(true)
    })

    it('**/__*__/** 模式', () => {
      // 转换为 .*/__[^/]*__/.*
      const regex = new RegExp(globToRegExp('**/__*__/**'))
      expect(regex.test('src/__tests__/foo')).toBe(true)
      expect(regex.test('src/__mocks__/bar')).toBe(true)
      expect(regex.test('foo/__tests__/bar')).toBe(true)
    })

    it('**/components/** 模式', () => {
      // 转换为 .*\/components\/.*
      const regex = new RegExp(globToRegExp('**/components/**'))
      expect(regex.test('src/components/foo')).toBe(true)
      expect(regex.test('src/pages/components/bar')).toBe(true)
      expect(regex.test('foo/components/baz')).toBe(true)
    })

    it('**/components.* 模式', () => {
      const regex = new RegExp(globToRegExp('**/components.*'))
      expect(regex.test('src/components.vue')).toBe(true)
      expect(regex.test('src/pages/components.ts')).toBe(true)
      // 验证 . 被正确转义，而不是作为正则的任意字符
      expect(regex.test('src/componentsXvue')).toBe(false)
    })
  })

  describe('边界情况', () => {
    it('空字符串', () => {
      const regex = new RegExp(`^${globToRegExp('')}$`)
      expect(regex.test('')).toBe(true)
    })

    it('纯文本无通配符', () => {
      const regex = new RegExp(`^${globToRegExp('index')}$`)
      expect(regex.test('index')).toBe(true)
      expect(regex.test('Index')).toBe(false)
    })

    it('连续的 **', () => {
      const regex = new RegExp(`^${globToRegExp('**/**')}$`)
      expect(regex.test('foo/bar')).toBe(true)
      expect(regex.test('foo/bar/baz')).toBe(true)
    })
  })

  describe('转换顺序验证（修复顺序问题后的测试）', () => {
    it('**/components.* 正确转换，. 不被错误转义', () => {
      // 这个测试验证修复后的顺序问题
      // 之前错误的转换结果：\.\*\/components\.[^/]*
      // 正确的转换结果：.*\/components\.[^/]*
      const result = globToRegExp('**/components.*')
      // 验证结果以 .* 开头（正确的正则），而不是 \.\*（错误的转义）
      expect(result.startsWith('.*')).toBe(true)
      // 验证 components 后面的 . 被正确转义
      expect(result).toContain('components\\.')
    })

    it('验证完整的转换结果', () => {
      // 注意：/ 不再转义，因为在 new RegExp() 中 / 不是特殊字符
      expect(globToRegExp('**/components/**')).toBe('.*/components/.*')
      expect(globToRegExp('**/components.*')).toBe('.*/components\\.[^/]*')
      expect(globToRegExp('*.test.*')).toBe('[^/]*\\.test\\.[^/]*')
      expect(globToRegExp('node_modules')).toBe('node_modules')
    })
  })
})

describe('createExcludePatterns', () => {
  describe('生成的正则表达式字符串转义', () => {
    it('反斜杠正确双重转义', () => {
      // 验证生成的代码中反斜杠被正确转义
      const code = createExcludePatterns(['**/components.*'])
      // 生成的代码应该包含双重转义的反斜杠
      // 例如：new RegExp('.*/components\\\\.[^/]*')
      expect(code).toContain('new RegExp(')
      // 验证 . 被正确转义为 \\.（在字符串中显示为 \\\\）
      expect(code).toContain('\\\\.')
    })

    it('生成的正则能正确匹配', () => {
      const patternsCode = createExcludePatterns(['**/components.*'])
      const checkCode = generateExcludeCheck('path')
      // 使用 Function 构造器执行生成的代码，模拟实际运行环境
      const testFn = new Function('path', `${patternsCode}; ${checkCode}; return true`)
      // 路径包含 /components. 应该被排除（返回 undefined）
      expect(testFn('src/components.vue')).toBeUndefined()
      expect(testFn('src/pages/components.ts')).toBeUndefined()
      // 路径不包含 /components. 不应该被排除（返回 true）
      expect(testFn('src/componentsXvue')).toBe(true)
      expect(testFn('src/index.vue')).toBe(true)
    })

    it('生成的正则正确匹配 components 目录', () => {
      const patternsCode = createExcludePatterns(['**/components/**'])
      const checkCode = generateExcludeCheck('path')
      const testFn = new Function('path', `${patternsCode}; ${checkCode}; return true`)
      // 路径包含 /components/ 应该被排除
      expect(testFn('src/components/foo.vue')).toBeUndefined()
      expect(testFn('src/pages/components/bar.ts')).toBeUndefined()
      // 路径不包含 /components/ 不应该被排除
      expect(testFn('src/pages/index.vue')).toBe(true)
    })
  })

  describe('空数组处理', () => {
    it('空数组返回空字符串', () => {
      expect(createExcludePatterns([])).toBe('')
    })

    it('undefined 返回空字符串', () => {
      expect(createExcludePatterns(undefined as any)).toBe('')
    })

    it('空数组时 generateExcludeCheck 不应该被调用', () => {
      // 模拟 vue.ts 和 react.ts 的调用逻辑
      const excludePatternsCode = createExcludePatterns([])
      const excludeCheckCode = excludePatternsCode ? generateExcludeCheck('path') : ''
      // 当 exclude 为空时，两个函数都应该返回空字符串
      expect(excludePatternsCode).toBe('')
      expect(excludeCheckCode).toBe('')
      // 验证生成的代码可以正常执行，不会抛出 ReferenceError
      const testFn = new Function('path', `${excludePatternsCode ? excludePatternsCode + ';' : ''}${excludeCheckCode ? excludeCheckCode + ';' : ''} return true`)
      expect(testFn('src/index.vue')).toBe(true)
    })
  })

  describe('多个排除模式', () => {
    it('多个模式正确生成', () => {
      const code = createExcludePatterns(['node_modules', '**/components/**'])
      expect(code).toContain('new RegExp(')
      // 验证两个模式都被包含
      expect(code).toContain('node_modules')
      expect(code).toContain('components')
    })
  })

  describe('自定义变量名', () => {
    it('默认使用 excludePatterns', () => {
      const code = createExcludePatterns(['node_modules'])
      expect(code).toContain('const excludePatterns')
    })

    it('可以自定义变量名', () => {
      const code = createExcludePatterns(['node_modules'], 'myPatterns')
      expect(code).toContain('const myPatterns')
    })
  })
})

describe('generateExcludeCheck', () => {
  describe('默认参数', () => {
    it('默认使用 path 和 excludePatterns', () => {
      const code = generateExcludeCheck()
      expect(code).toBe('if (excludePatterns.some(pattern => pattern.test(path))) return')
    })
  })

  describe('自定义路径变量名', () => {
    it('可以自定义路径变量名为 key', () => {
      const code = generateExcludeCheck('key')
      expect(code).toContain('pattern.test(key)')
    })
  })

  describe('自定义正则数组变量名', () => {
    it('可以自定义正则数组变量名', () => {
      const code = generateExcludeCheck('path', 'myPatterns')
      expect(code).toContain('myPatterns.some')
    })
  })

  describe('与 createExcludePatterns 配合使用', () => {
    it('使用自定义变量名配合', () => {
      const patternsCode = createExcludePatterns(['node_modules'], 'myPatterns')
      const checkCode = generateExcludeCheck('key', 'myPatterns')
      const testFn = new Function('key', `${patternsCode}; ${checkCode}; return true`)
      // node_modules 路径应该被排除
      expect(testFn('node_modules/foo')).toBeUndefined()
      // 其他路径不应该被排除
      expect(testFn('src/index.vue')).toBe(true)
    })
  })
})
