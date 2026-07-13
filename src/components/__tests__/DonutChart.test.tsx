import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DonutChart from '../DonutChart'

describe('DonutChart', () => {
  it('should render title', () => {
    render(<DonutChart total={0} redCount={0} yellowCount={0} greenCount={0} />)
    expect(screen.getByText('Prioridades Atendidas')).toBeInTheDocument()
  })

  it('should render total value', () => {
    render(<DonutChart total={42} redCount={10} yellowCount={12} greenCount={20} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should render legend with correct percentages', () => {
    render(<DonutChart total={100} redCount={25} yellowCount={35} greenCount={40} />)
    expect(screen.getByText(/Vermelho \(25%\)/)).toBeInTheDocument()
    expect(screen.getByText(/Amarelo \(35%\)/)).toBeInTheDocument()
    expect(screen.getByText(/Verde \(40%\)/)).toBeInTheDocument()
  })

  it('should render legend with dashes for zero values', () => {
    render(<DonutChart total={0} redCount={0} yellowCount={0} greenCount={0} />)
    expect(screen.getByText(/Vermelho \(0%\)/)).toBeInTheDocument()
    expect(screen.getByText(/Amarelo \(0%\)/)).toBeInTheDocument()
    expect(screen.getByText(/Verde \(0%\)/)).toBeInTheDocument()
  })

  it('should render "Fichas" label', () => {
    render(<DonutChart total={10} redCount={3} yellowCount={3} greenCount={4} />)
    expect(screen.getByText('Fichas')).toBeInTheDocument()
  })
})
