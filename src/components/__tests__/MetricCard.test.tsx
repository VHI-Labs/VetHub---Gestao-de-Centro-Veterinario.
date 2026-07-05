import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MetricCard from '../MetricCard'

describe('MetricCard', () => {
  it('should render the icon', () => {
    render(<MetricCard icon="🐾" label="Pacientes" value={42} />)
    expect(screen.getByText('🐾')).toBeInTheDocument()
  })

  it('should render the label text', () => {
    render(<MetricCard icon="📊" label="Consultas" value={15} />)
    expect(screen.getByText('Consultas')).toBeInTheDocument()
  })

  it('should render the numeric value', () => {
    render(<MetricCard icon="🏥" label="Internações" value={7} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('should render value 0 correctly', () => {
    render(<MetricCard icon="📋" label="Exames" value={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('should render large numbers', () => {
    render(<MetricCard icon="📈" label="Total" value={9999} />)
    expect(screen.getByText('9999')).toBeInTheDocument()
  })

  it('should apply correct CSS class', () => {
    const { container } = render(<MetricCard icon="⭐" label="Teste" value={1} />)
    const card = container.querySelector('.metric-card')
    expect(card).toBeInTheDocument()
  })
})
