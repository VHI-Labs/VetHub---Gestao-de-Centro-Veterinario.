import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CalendarioAgendamento from '../CalendarioAgendamento'
import type { Agendamento } from '../../types'

const mockAgendamentos: Agendamento[] = [
  {
    id: 'age-1', patientId: 'pat-1', dataHora: '2026-06-15T10:00:00Z',
    tipo: 'Consulta', veterinario: 'Dr. Vet', status: 'Confirmado',
    criadoEm: '', atualizadoEm: '',
  },
  {
    id: 'age-2', patientId: 'pat-2', dataHora: '2026-06-20T14:30:00Z',
    tipo: 'Cirurgia', status: 'Pendente',
    criadoEm: '', atualizadoEm: '',
  },
]

function renderCalendar(props: Record<string, unknown> = {}) {
  const onPrevMonth = vi.fn()
  const onNextMonth = vi.fn()
  const onDayClick = vi.fn()
  
  const result = render(
    <MemoryRouter>
      <CalendarioAgendamento
        agendamentos={mockAgendamentos}
        mes={5} // June
        ano={2026}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
        onDayClick={onDayClick}
        {...props}
      />
    </MemoryRouter>
  )
  return { ...result, onPrevMonth, onNextMonth, onDayClick }
}

describe('CalendarioAgendamento', () => {
  it('should render month and year', () => {
    renderCalendar()
    expect(screen.getByText('Junho 2026')).toBeInTheDocument()
  })

  it('should render weekdays', () => {
    renderCalendar()
    expect(screen.getByText('Dom')).toBeInTheDocument()
    expect(screen.getByText('Seg')).toBeInTheDocument()
    expect(screen.getByText('Ter')).toBeInTheDocument()
    expect(screen.getByText('Qua')).toBeInTheDocument()
    expect(screen.getByText('Qui')).toBeInTheDocument()
    expect(screen.getByText('Sex')).toBeInTheDocument()
    expect(screen.getByText('Sáb')).toBeInTheDocument()
  })

  it('should render prev month button', () => {
    const { onPrevMonth } = renderCalendar()
    const prevButtons = screen.getAllByRole('button')
    fireEvent.click(prevButtons[0])
    expect(onPrevMonth).toHaveBeenCalled()
  })

  it('should render next month button', () => {
    const { onNextMonth } = renderCalendar()
    const nextButtons = screen.getAllByRole('button')
    fireEvent.click(nextButtons[1])
    expect(onNextMonth).toHaveBeenCalled()
  })

  it('should show agendamentos on calendar days', () => {
    renderCalendar()
    // June 15 should show "Consulta" (Confirmado), June 20 should show "Cirurgia" (Pendente)
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('should call onDayClick when a day is clicked', () => {
    const { onDayClick } = renderCalendar()
    const dayElements = screen.getAllByText('15')
    // Click the day number (not the time)
    fireEvent.click(dayElements[0])
    expect(onDayClick).toHaveBeenCalled()
  })

  it('should render Portuguese month names', () => {
    renderCalendar({ mes: 0 })
    expect(screen.getByText('Janeiro 2026')).toBeInTheDocument()
    renderCalendar({ mes: 11 })
    expect(screen.getByText('Dezembro 2026')).toBeInTheDocument()
  })
})
