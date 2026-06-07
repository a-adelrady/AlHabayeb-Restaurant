import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  MdEmail, MdLock, MdPerson, MdPhone,
  MdVisibility, MdVisibilityOff, MdArrowBack,
  MdCheckCircle,
} from 'react-icons/md'
import toast from 'react-hot-toast'
import { useRoleAuth as useUserAuth, getAuthError as getUserAuthError } from '../context/RoleAuthContext.jsx'
import { getEgyptianPhoneError, sanitizeText, validateEmail } from '../utils/helpers'
import { DEMO_MODE } from '../services/firebase'

export default function AuthPage() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const initTab   = location.state?.tab || 'login'

  const [tab,      setTab]      = useState(initTab)
  const [showPwd,  setShowPwd]  = useState(false)
  const [busy,     setBusy]     = useState(false)
  const [success,  setSuccess]  = useState(false)

  // FIX: removed `upsertCustomer` call — that action does not exist in the store.
  // Calling a non-existent store action throws a runtime error silently in Zustand
  // (returns undefined) and the destructure throws "upsertCustomer is not a function".
  const { login, register, resetPassword } = useUserAuth()

  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirm:'' })
  const [errors, setErrors] = useState({})

  const setField = (field, val) => {
    setForm(f => ({ ...f, [field]: val }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateRegister = () => {
    const e = {}
    const name = sanitizeText(form.name)
    if (!name || name.length < 2)         e.name    = 'الاسم لازم يكون على الأقل حرفين'
    if (!form.email.trim())               e.email   = 'البريد الإلكتروني مطلوب'
    else if (!validateEmail(form.email))  e.email   = 'البريد مش صحيح'
    const phoneErr = getEgyptianPhoneError(form.phone)
    if (phoneErr)                         e.phone   = phoneErr
    if (!form.password)                   e.password= 'كلمة المرور مطلوبة'
    else if (form.password.length < 6)    e.password= 'لازم 6 حروف على الأقل'
    if (form.password !== form.confirm)   e.confirm = 'كلمة المرور مش متطابقة'
    return e
  }

  const validateLogin = () => {
    const e = {}
    if (!form.email.trim())    e.email   = 'البريد الإلكتروني مطلوب'
    if (!form.password.trim()) e.password= 'كلمة المرور مطلوبة'
    return e
  }

  // ── Submit handlers ────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault()
    const errs = validateRegister()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setBusy(true)
    try {
      await register({
        name:     sanitizeText(form.name),
        email:    form.email.trim().toLowerCase(),
        phone:    form.phone.trim(),
        password: form.password,
      })
      toast.success('تم إنشاء الحساب بنجاح! أهلاً بيك 🎉')
      const from = location.state?.from || '/'
      navigate(from, { replace: true })
    } catch (err) {
      const code = err.code || err.message
      toast.error(getUserAuthError(code))
    } finally {
      setBusy(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const errs = validateLogin()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setBusy(true)
    try {
      await login(form.email.trim().toLowerCase(), form.password)
      toast.success('أهلاً بك! 👋')
      const from = location.state?.from || '/'
      navigate(from, { replace: true })
    } catch (err) {
      const code = err.code || err.message
      toast.error(getUserAuthError(code))
    } finally {
      setBusy(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (!form.email.trim()) { setErrors({ email: 'البريد الإلكتروني مطلوب' }); return }
    if (!validateEmail(form.email)) { setErrors({ email: 'البريد مش صحيح' }); return }
    setBusy(true)
    try {
      await resetPassword(form.email.trim().toLowerCase())
      setSuccess(true)
    } catch (err) {
      toast.error(getUserAuthError(err.code || err.message))
    } finally {
      setBusy(false)
    }
  }

  const switchTab = (newTab) => {
    setTab(newTab)
    setErrors({})
    setSuccess(false)
    setShowPwd(false)
  }

  return (
    <>
      <Helmet>
        <title>{tab === 'login' ? 'تسجيل الدخول' : tab === 'register' ? 'إنشاء حساب' : 'استعادة كلمة المرور'} — مطعم الحبايب</title>
      </Helmet>

      <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pt-20 flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Back */}
          <Link to="/" className="inline-flex items-center gap-2 dark:text-zinc-400 text-gray-500 hover:text-gold-500 transition-colors mb-6 text-sm">
            <MdArrowBack className="rotate-180" /> العودة للرئيسية
          </Link>

          {/* Card */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-gray-100 p-8 shadow-xl">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gold-500 flex items-center justify-center text-black font-bold text-xl">ح</div>
              <div>
                <h1 className="font-bold dark:text-white text-gray-900 text-lg leading-none">مطعم الحبايب</h1>
                <p className="text-xs dark:text-zinc-500 text-gray-400 mt-0.5">
                  {tab === 'login' ? 'سجّل دخولك' : tab === 'register' ? 'إنشاء حساب جديد' : 'استعادة كلمة المرور'}
                </p>
              </div>
            </div>

            {/* Tabs */}
            {tab !== 'reset' && (
              <div className="flex mb-6 p-1 dark:bg-zinc-800 bg-gray-100 rounded-xl">
                {[
                  { id: 'login',    label: 'دخول' },
                  { id: 'register', label: 'حساب جديد' },
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => switchTab(t.id)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      tab === t.id
                        ? 'dark:bg-zinc-700 bg-white shadow-sm dark:text-white text-gray-900'
                        : 'dark:text-zinc-400 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {DEMO_MODE && (
              <div className="mb-4 p-3 rounded-xl bg-gold-500/10 border border-gold-500/20 text-xs dark:text-zinc-300 text-gray-600">
                🔧 وضع تجريبي — البيانات محفوظة محلياً فقط
              </div>
            )}

            <AnimatePresence mode="wait">
              {tab === 'login' && (
                <motion.form key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onSubmit={handleLogin} noValidate className="space-y-4">
                  <AuthField label="البريد الإلكتروني" error={errors.email}>
                    <MdEmail className="field-icon" />
                    <input type="email" placeholder="example@email.com" dir="ltr"
                      value={form.email} onChange={e => setField('email', e.target.value)}
                      autoComplete="email" className={fieldCls(errors.email)} />
                  </AuthField>
                  <AuthField label="كلمة المرور" error={errors.password}>
                    <MdLock className="field-icon" />
                    <input type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                      value={form.password} onChange={e => setField('password', e.target.value)}
                      autoComplete="current-password" className={fieldCls(errors.password)} />
                    <button type="button" onClick={() => setShowPwd(p => !p)}
                      aria-label={showPwd ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200">
                      {showPwd ? <MdVisibilityOff className="text-xl" /> : <MdVisibility className="text-xl" />}
                    </button>
                  </AuthField>
                  <button type="button" onClick={() => switchTab('reset')}
                    className="text-gold-500 hover:text-gold-400 text-xs text-right w-full block">
                    نسيت كلمة المرور؟
                  </button>
                  <SubmitButton busy={busy} label="تسجيل الدخول" />
                </motion.form>
              )}

              {tab === 'register' && (
                <motion.form key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onSubmit={handleRegister} noValidate className="space-y-4">
                  <AuthField label="الاسم الكامل" error={errors.name}>
                    <MdPerson className="field-icon" />
                    <input type="text" placeholder="اسمك الكامل"
                      value={form.name} onChange={e => setField('name', e.target.value)}
                      autoComplete="name" maxLength={60} className={fieldCls(errors.name)} />
                  </AuthField>
                  <AuthField label="البريد الإلكتروني" error={errors.email}>
                    <MdEmail className="field-icon" />
                    <input type="email" placeholder="example@email.com" dir="ltr"
                      value={form.email} onChange={e => setField('email', e.target.value)}
                      autoComplete="email" className={fieldCls(errors.email)} />
                  </AuthField>
                  <AuthField label="رقم الموبايل" error={errors.phone} hint="01xxxxxxxxx">
                    <MdPhone className="field-icon" />
                    <input type="tel" placeholder="01xxxxxxxxx" dir="ltr" inputMode="numeric"
                      value={form.phone} onChange={e => setField('phone', e.target.value)}
                      autoComplete="tel" maxLength={13} className={fieldCls(errors.phone)} />
                  </AuthField>
                  <AuthField label="كلمة المرور" error={errors.password}>
                    <MdLock className="field-icon" />
                    <input type={showPwd ? 'text' : 'password'} placeholder="٦ أحرف على الأقل"
                      value={form.password} onChange={e => setField('password', e.target.value)}
                      autoComplete="new-password" className={fieldCls(errors.password)} />
                    <button type="button" onClick={() => setShowPwd(p => !p)}
                      aria-label={showPwd ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200">
                      {showPwd ? <MdVisibilityOff className="text-xl" /> : <MdVisibility className="text-xl" />}
                    </button>
                  </AuthField>
                  <AuthField label="تأكيد كلمة المرور" error={errors.confirm}>
                    <MdLock className="field-icon" />
                    <input type="password" placeholder="أعد كتابة كلمة المرور"
                      value={form.confirm} onChange={e => setField('confirm', e.target.value)}
                      autoComplete="new-password" className={fieldCls(errors.confirm)} />
                  </AuthField>
                  <SubmitButton busy={busy} label="إنشاء الحساب" />
                </motion.form>
              )}

              {tab === 'reset' && (
                <motion.form key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onSubmit={handleReset} noValidate className="space-y-4">
                  {success ? (
                    <div className="text-center py-4">
                      <MdCheckCircle className="text-green-400 text-5xl mx-auto mb-3" />
                      <p className="dark:text-white text-gray-900 font-semibold">تم الإرسال!</p>
                      <p className="text-sm dark:text-zinc-400 text-gray-500 mt-1">راجع بريدك الإلكتروني</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm dark:text-zinc-400 text-gray-500 mb-2">سنرسل لك رابط إعادة التعيين</p>
                      <AuthField label="البريد الإلكتروني" error={errors.email}>
                        <MdEmail className="field-icon" />
                        <input type="email" placeholder="example@email.com" dir="ltr"
                          value={form.email} onChange={e => setField('email', e.target.value)}
                          autoComplete="email" className={fieldCls(errors.email)} />
                      </AuthField>
                      <SubmitButton busy={busy} label="إرسال رابط الاستعادة" />
                    </>
                  )}
                  <button type="button" onClick={() => switchTab('login')}
                    className="w-full text-center text-sm dark:text-zinc-400 text-gray-500 hover:text-gold-500 transition-colors mt-2">
                    ← عودة لتسجيل الدخول
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  )
}

/* ── Sub-components ── */
function fieldCls(error) {
  return `w-full pr-10 pl-10 py-3 rounded-xl dark:bg-zinc-800 bg-gray-50 border-2 dark:text-white text-gray-900 placeholder-zinc-500 outline-none transition-colors text-sm
    ${error ? 'border-red-500' : 'dark:border-zinc-700 border-gray-200 focus:border-gold-500'}`
}

function AuthField({ label, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium dark:text-zinc-300 text-gray-700 mb-1.5">{label}</label>
      <div className="relative [&_.field-icon]:absolute [&_.field-icon]:right-3 [&_.field-icon]:top-1/2 [&_.field-icon]:-translate-y-1/2 [&_.field-icon]:text-zinc-400 [&_.field-icon]:text-xl [&_.field-icon]:pointer-events-none">
        {children}
      </div>
      {hint  && !error && <p className="text-zinc-500 text-xs mt-1">{hint}</p>}
      {error && <p role="alert" className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

function SubmitButton({ busy, label }) {
  return (
    <motion.button type="submit" disabled={busy} whileTap={{ scale: 0.98 }}
      className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2">
      {busy
        ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
        : label
      }
    </motion.button>
  )
}
