import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PageTransition from '../PageTransition'

describe('PageTransition', () => {
  it('should render children', () => {
    render(
      <PageTransition>
        <div>Test content</div>
      </PageTransition>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should render multiple children', () => {
    render(
      <PageTransition>
        <h1>Title</h1>
        <p>Description</p>
      </PageTransition>
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <PageTransition className="custom-class">
        <div>Content</div>
      </PageTransition>
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
