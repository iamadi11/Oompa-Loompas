/** @vitest-environment happy-dom */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginForm } from './LoginForm'

const push = vi.fn()
const refresh = vi.fn()

const toastError = vi.hoisted(() => vi.fn())
const toastSuccess = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    error: toastError,
    success: toastSuccess,
  },
}))

const loginMock = vi.fn()

vi.mock('@/lib/api', () => ({
  api: {
    login: (...args: unknown[]) => loginMock(...args),
  },
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    loginMock.mockReset()
    toastError.mockReset()
    toastSuccess.mockReset()
  })

  it('shows validation toast when email and password are missing (action)', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))
    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith('Enter your email and password.')
    })
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('shows API error toast when login fails', async () => {
    const user = userEvent.setup()
    loginMock.mockRejectedValueOnce(new Error('Invalid email or password'))
    render(<LoginForm />)
    await user.type(screen.getByRole('textbox', { name: /^email$/i }), 'a@test.dev')
    await user.type(screen.getByLabelText(/^password$/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))
    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith('Invalid email or password')
    })
    expect(loginMock).toHaveBeenCalledWith({ email: 'a@test.dev', password: 'wrong' })
  })

  it('navigates to dashboard on success', async () => {
    const user = userEvent.setup()
    loginMock.mockResolvedValueOnce({
      data: { id: 'u1', email: 'a@test.dev', roles: ['MEMBER'] },
    })
    render(<LoginForm />)
    await user.type(screen.getByRole('textbox', { name: /^email$/i }), 'a@test.dev')
    await user.type(screen.getByLabelText(/^password$/i), 'secret')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))
    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledWith('Signed in')
      expect(push).toHaveBeenCalledWith('/dashboard')
      expect(refresh).toHaveBeenCalled()
    })
  })

  it('respects redirectFrom for safe same-origin paths', async () => {
    const user = userEvent.setup()
    loginMock.mockResolvedValueOnce({
      data: { id: 'u1', email: 'a@test.dev', roles: ['MEMBER'] },
    })
    render(<LoginForm redirectFrom="/deals" />)
    await user.type(screen.getByRole('textbox', { name: /^email$/i }), 'a@test.dev')
    await user.type(screen.getByLabelText(/^password$/i), 'secret')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/deals')
    })
  })

  it('shows pending label on submit while login is in flight', async () => {
    const user = userEvent.setup()
    let release: (() => void) | undefined
    loginMock.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          release = () => {
            resolve()
          }
        }),
    )
    render(<LoginForm />)
    await user.type(screen.getByRole('textbox', { name: /^email$/i }), 'a@test.dev')
    await user.type(screen.getByLabelText(/^password$/i), 'secret')
    void user.click(screen.getByRole('button', { name: /^sign in$/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
    })
    release?.()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^sign in$/i })).not.toBeDisabled()
    })
  })
})
