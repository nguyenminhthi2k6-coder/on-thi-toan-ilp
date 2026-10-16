import React, { useMemo, useState } from 'react'
import solver from 'javascript-lp-solver'
import { Activity, BookOpen, Calculator, CheckCircle2, Clock3, Download, FileText, RotateCcw, Sparkles, Target, TrendingDown } from 'lucide-react'

const topics = [
  'Hàm số & Đồ thị',
  'Mũ & Logarit',
  'Nguyên hàm - Tích phân',
  'Số phức',
  'Hình học không gian cổ điển',
  'Hình học Tọa độ Oxyz',
  'Xác suất & Thống kê',
  'Cấp số cộng - Cấp số nhân'
]
const defaultK = [5, 4, 5, 4, 4, 4, 3, 3]
const sampleS = [4, 3, 4, 2, 3, 3, 2, 1]
const resources = [
  { key: 'x1', name: 'TL1', subtitle: 'Đại số', time: 3.5, limit: 15, color: 'teal', a: [8, 6, 6, 4, 0, 0, 2, 2] },
  { key: 'x2', name: 'TL2', subtitle: 'Hình học', time: 2.5, limit: 12, color: 'blue', a: [0, 0, 0, 0, 6, 8, 0, 0] },
  { key: 'x3', name: 'TL3', subtitle: 'Đề thi chuẩn', time: 2.0, limit: 30, color: 'violet', a: [10, 8, 7, 5, 5, 8, 4, 3] },
  { key: 'x4', name: 'TL4', subtitle: 'Phiếu gỡ điểm', time: 1.0, limit: 20, color: 'amber', a: [4, 3, 0, 2, 1, 2, 2, 1] }
]

function solveILP(targets) {
  const model = {
    optimize: 'cost',
    opType: 'min',
    constraints: {},
    variables: {},
    ints: {}
  }
  targets.forEach((target, i) => { model.constraints[`topic${i}`] = { min: target } })
  resources.forEach((r) => {
    model.constraints[`limit_${r.key}`] = { max: r.limit }
    const variable = { cost: r.time, [`limit_${r.key}`]: 1 }
    r.a.forEach((amount, i) => { variable[`topic${i}`] = amount })
    model.variables[r.key] = variable
    model.ints[r.key] = 1
  })
  const result = solver.Solve(model)
  if (!result.feasible) return { feasible: false }
  const counts = resources.map(r => Math.round(result[r.key] || 0))
  const actual = topics.map((_, i) => resources.reduce((sum, r, j) => sum + r.a[i] * counts[j], 0))
  return { feasible: true, counts, actual, totalTime: resources.reduce((sum, r, j) => sum + r.time * counts[j], 0) }
}

function fmt(value) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(value)
}

function NumberField({ value, onChange, label, min = 0, max = 999 }) {
  return <input aria-label={label} type="number" min={min} max={max} step="1" value={value}
    onChange={e => onChange(Math.min(max, Math.max(min, Number(e.target.value) || 0)))}
    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center font-semibold text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" />
}

function App() {
  const [mistakes, setMistakes] = useState(Array(8).fill(0))
  const [weights, setWeights] = useState(defaultK)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const targets = useMemo(() => mistakes.map((s, i) => s * weights[i]), [mistakes, weights])
  const totalMistakes = mistakes.reduce((a, b) => a + b, 0)
  const totalTarget = targets.reduce((a, b) => a + b, 0)

  function updateAt(setter, index, value) {
    setter(old => old.map((v, i) => i === index ? value : v))
  }
  function loadSample() {
    setMistakes(sampleS)
    setWeights(defaultK)
    setResult(null)
    setError('')
  }
  function resetAll() {
    setMistakes(Array(8).fill(0))
    setWeights(defaultK)
    setResult(null)
    setError('')
  }
  function optimize() {
    setError('')
    const next = solveILP(targets)
    if (!next.feasible) {
      setResult(null)
      setError('Không tìm thấy phương án thỏa mãn các ràng buộc. Hãy kiểm tra chỉ tiêu cần bù hoặc giới hạn tài liệu.')
      return
    }
    setResult(next)
  }

  return (
    <div className="min-h-screen bg-[#f4f8f8] text-slate-800">
      <header className="relative overflow-hidden bg-gradient-to-br from-[#0b3b45] via-[#0f766e] to-[#159e91] text-white">
        <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-36 right-1/4 h-72 w-72 rounded-full bg-teal-200/10" />
        <div className="relative mx-auto max-w-7xl px-5 py-9 md:px-8 md:py-12">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold tracking-wide text-teal-100">
            <span className="rounded-lg bg-white/15 p-2"><Calculator size={19}/></span>
            CÔNG CỤ HỌC TẬP • QUY HOẠCH TUYẾN TÍNH NGUYÊN
          </div>
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-end">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-black leading-tight tracking-tight md:text-5xl">Tối ưu hóa kế hoạch<br className="hidden md:block"/> ôn thi môn Toán</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-teal-50 md:text-lg">Chẩn đoán lỗ hổng kiến thức, phân bổ tài liệu hợp lý và tìm lộ trình có tổng thời gian làm bài thấp nhất.</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="rounded-xl bg-white/15 p-3"><Sparkles size={24}/></div>
              <div><div className="text-2xl font-extrabold">8 × 4</div><div className="text-sm text-teal-100">chuyên đề × tài liệu</div></div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-7 md:px-8 md:py-9">
        <section className="grid gap-4 sm:grid-cols-3">
          <Stat icon={<Activity size={19}/>} label="Tổng câu sai" value={`${fmt(totalMistakes)} câu`} note="Theo kết quả tự đánh giá" />
          <Stat icon={<Target size={19}/>} label="Tổng chỉ tiêu bù" value={`${fmt(totalTarget)} đơn vị`} note="Sᵢ = số câu sai × hệ số kᵢ" />
          <Stat icon={<Clock3 size={19}/>} label="Mục tiêu tối ưu" value={result ? `${fmt(result.totalTime)} giờ` : 'Chưa giải'} note="Tổng thời gian nhỏ nhất tìm được" />
        </section>

        <section className="print-area rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft md:p-7">
          <SectionTitle number="01" icon={<Target size={20}/>} title="Chẩn đoán sai sót" subtitle="Nhập số câu sai ở từng chuyên đề và điều chỉnh hệ số ưu tiên nếu cần." />
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[650px] border-separate border-spacing-0 text-sm">
              <thead><tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="rounded-l-xl px-4 py-3">Chuyên đề</th><th className="w-28 px-3 py-3 text-center">Số câu sai (sᵢ)</th><th className="w-28 px-3 py-3 text-center">Hệ số (kᵢ)</th><th className="rounded-r-xl px-3 py-3 text-center">Chỉ tiêu (Sᵢ)</th>
              </tr></thead>
              <tbody>{topics.map((topic, i) => <tr key={topic} className="group">
                <td className="border-b border-slate-100 px-4 py-3.5"><div className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-xs font-bold text-teal-700">{String(i+1).padStart(2,'0')}</span><span className="font-semibold text-slate-700">{topic}</span></div></td>
                <td className="border-b border-slate-100 px-3 py-2"><NumberField label={`Số câu sai ${topic}`} value={mistakes[i]} onChange={v => { updateAt(setMistakes, i, v); setResult(null) }} /></td>
                <td className="border-b border-slate-100 px-3 py-2"><NumberField label={`Hệ số ${topic}`} value={weights[i]} max={100} onChange={v => { updateAt(setWeights, i, v); setResult(null) }} /></td>
                <td className="border-b border-slate-100 px-3 py-3 text-center"><span className="inline-flex min-w-14 justify-center rounded-lg bg-teal-50 px-3 py-2 font-extrabold text-teal-800">{fmt(targets[i])}</span></td>
              </tr>)}</tbody>
              <tfoot><tr><td className="px-4 pt-4 font-bold text-slate-700">Tổng cộng</td><td className="px-3 pt-4 text-center font-extrabold">{fmt(totalMistakes)}</td><td className="px-3 pt-4 text-center text-slate-400">—</td><td className="px-3 pt-4 text-center font-extrabold text-teal-800">{fmt(totalTarget)}</td></tr></tfoot>
            </table>
          </div>
          <div className="no-print mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">Hệ số kᵢ càng lớn, chỉ tiêu bù đắp cho chuyên đề càng cao.</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={resetAll} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"><RotateCcw size={16}/> Đặt lại</button>
              <button onClick={loadSample} className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-bold text-teal-800 transition hover:bg-teal-100">Tải dữ liệu mẫu</button>
              <button onClick={optimize} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-700/20 transition hover:bg-teal-800"><Sparkles size={17}/> Tối ưu hóa lộ trình</button>
            </div>
          </div>
          {error && <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</div>}
        </section>

        {result && <section className="print-area rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft md:p-7">
          <SectionTitle number="02" icon={<TrendingDown size={20}/>} title="Kết quả tối ưu" subtitle="Phương án nguyên thỏa mãn các chỉ tiêu với tổng thời gian nhỏ nhất theo mô hình." />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {resources.map((r, i) => <div key={r.key} className="print-break rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between"><div><div className="text-xs font-bold uppercase tracking-wider text-slate-400">{r.name}</div><div className="mt-1 font-bold text-slate-800">{r.subtitle}</div></div><BookOpen className="text-teal-700" size={20}/></div>
              <div className="mt-4 flex items-end justify-between"><div><span className="text-3xl font-black text-slate-900">{result.counts[i]}</span><span className="ml-1 text-sm text-slate-500">lần</span></div><span className="text-sm font-semibold text-slate-500">{fmt(r.time)} giờ/lần</span></div>
              <div className="mt-3 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-teal-600" style={{width: `${Math.min(100, result.counts[i] / r.limit * 100)}%`}} /></div>
              <div className="mt-2 text-xs text-slate-500">Giới hạn: {r.limit} lần</div>
            </div>)}
          </div>
          <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-[#0b3b45] p-5 text-white sm:flex-row sm:items-center sm:justify-between">
            <div><div className="text-sm font-medium text-teal-100">Tổng thời gian tối thiểu</div><div className="mt-1 text-4xl font-black">{fmt(result.totalTime)} <span className="text-lg font-semibold">giờ</span></div></div>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm"><CheckCircle2 size={19} className="text-teal-200"/> Đã tìm thấy phương án khả thi</div>
          </div>

          <div className="mt-7">
            <h3 className="font-bold text-slate-800">Bảng đối soát theo chuyên đề</h3>
            <p className="mt-1 text-sm text-slate-500">Chênh lệch = thực tế đạt được − chỉ tiêu cần bù.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[680px] border-separate border-spacing-0 text-sm">
                <thead><tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="rounded-l-xl px-4 py-3">Chuyên đề</th><th className="px-3 py-3 text-right">Chỉ tiêu cần</th><th className="px-3 py-3 text-right">Thực tế đạt</th><th className="px-3 py-3 text-right">Chênh lệch</th><th className="rounded-r-xl px-4 py-3 text-right">Đáp ứng</th>
                </tr></thead>
                <tbody>{topics.map((topic, i) => {
                  const diff = result.actual[i] - targets[i]
                  const ratio = targets[i] === 0 ? 100 : result.actual[i] / targets[i] * 100
                  return <tr key={topic}>
                    <td className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-700">{topic}</td>
                    <td className="border-b border-slate-100 px-3 py-3 text-right tabular-nums">{fmt(targets[i])}</td>
                    <td className="border-b border-slate-100 px-3 py-3 text-right font-bold tabular-nums">{fmt(result.actual[i])}</td>
                    <td className="border-b border-slate-100 px-3 py-3 text-right tabular-nums"><span className={diff > 0 ? 'font-semibold text-amber-700' : 'text-slate-500'}>{diff > 0 ? '+' : ''}{fmt(diff)}</span></td>
                    <td className="border-b border-slate-100 px-4 py-3 text-right"><span className={`inline-flex min-w-16 justify-center rounded-lg px-2.5 py-1.5 font-bold ${ratio >= 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{fmt(ratio)}%</span></td>
                  </tr>
                })}</tbody>
              </table>
            </div>
          </div>
          <div className="no-print mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">Chọn in và lưu dưới dạng PDF trong hộp thoại in của trình duyệt.</p>
            <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700"><Download size={17}/> Xuất thời khóa biểu / Lộ trình ôn tập</button>
          </div>
        </section>}

        {!result && <section className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 text-center md:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><FileText size={23}/></div>
          <h3 className="mt-3 font-bold text-slate-800">Lộ trình của bạn sẽ xuất hiện tại đây</h3>
          <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-slate-500">Nhập số câu sai, nhấn “Tối ưu hóa lộ trình” để tính số lần làm từng tài liệu và xem bảng đối soát.</p>
        </section>}

        <section className="no-print rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-bold text-slate-800">Mô hình toán học</h3>
          <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4"><div className="font-bold text-slate-800">Hàm mục tiêu</div><p className="mt-1">min Z = 3,5x₁ + 2,5x₂ + 2x₃ + x₄</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><div className="font-bold text-slate-800">Ràng buộc kiến thức</div><p className="mt-1">Σ aᵢⱼxⱼ ≥ Sᵢ, với Sᵢ = sᵢkᵢ</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><div className="font-bold text-slate-800">Giới hạn & tính nguyên</div><p className="mt-1">0 ≤ xⱼ ≤ Mⱼ; xⱼ ∈ ℤ, giải bằng javascript-lp-solver.</p></div>
          </div>
        </section>
        <footer className="pb-5 text-center text-xs text-slate-400">Hệ thống hỗ trợ lập kế hoạch học tập • Kết quả phụ thuộc vào dữ liệu đầu vào và mô hình tài liệu.</footer>
      </main>
    </div>
  )
}

function Stat({ icon, label, value, note }) {
  return <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft">
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><span className="text-teal-700">{icon}</span>{label}</div>
    <div className="mt-3 text-2xl font-black tracking-tight text-slate-900">{value}</div>
    <div className="mt-1 text-xs text-slate-400">{note}</div>
  </div>
}
function SectionTitle({ number, icon, title, subtitle }) {
  return <div className="flex gap-3">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">{icon}</div>
    <div><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-black tracking-widest text-teal-700">PHẦN {number}</span><h2 className="text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">{title}</h2></div><p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p></div>
  </div>
}
export default App
