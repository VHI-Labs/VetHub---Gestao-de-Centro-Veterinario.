import { readFileSync } from 'fs'

const raw = JSON.parse(readFileSync('./coverage/coverage-final.json', 'utf8'))
const files = Object.keys(raw)
  .filter(k => k.includes('src') && !k.includes('__tests__') && !k.includes('test/'))
  .map(k => {
    const f = raw[k]
    const s = Object.values(f.s).filter(Boolean).length
    const st = Object.keys(f.s).length
    const b = Object.values(f.b).flat().filter(Boolean).length
    const br = Object.values(f.b).flat().length
    const fn = Object.values(f.f).filter(Boolean).length
    const fu = Object.keys(f.f).length
    return {
      file: k.replace(/^.*[/\\]src[/\\]/, 'src/'),
      stmts: st ? Math.round(s / st * 100) : 0,
      branches: br ? Math.round(b / br * 100) : 0,
      funcs: fu ? Math.round(fn / fu * 100) : 0,
    }
  })
  .sort((a, b) => a.stmts - b.stmts)

console.log('\n=== 🔴 PIOR COBERTURA (25 menores) ===')
files.slice(0, 25).forEach(f =>
  console.log(`  ${f.file.padEnd(40)} Stmts:${String(f.stmts).padStart(3)}%  Br:${String(f.branches).padStart(3)}%  Fn:${String(f.funcs).padStart(3)}%`)
)

console.log('\n=== 🟢 MELHOR COBERTURA (25 maiores) ===')
files.slice(-25).reverse().forEach(f =>
  console.log(`  ${f.file.padEnd(40)} Stmts:${String(f.stmts).padStart(3)}%  Br:${String(f.branches).padStart(3)}%  Fn:${String(f.funcs).padStart(3)}%`)
)

const avg = n => Math.round(files.reduce((a, f) => a + f[n], 0) / files.length)
console.log(`\n=== 📊 MÉDIA GERAL ===`)
console.log(`  Statements: ${avg('stmts')}%  Branches: ${avg('branches')}%  Functions: ${avg('funcs')}%`)
console.log(`\n=== 📋 RESUMO ===`)
console.log(`  Total arquivos: ${files.length}`)
console.log(`  Abaixo de 30%: ${files.filter(f => f.stmts < 30).length} arquivos`)
console.log(`  Entre 30-70%: ${files.filter(f => f.stmts >= 30 && f.stmts < 70).length} arquivos`)
console.log(`  Acima de 70%: ${files.filter(f => f.stmts >= 70).length} arquivos`)
