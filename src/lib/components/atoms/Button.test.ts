/**
 * @fileoverview Button Component Tests
 * 
 * Comprehensive test suite for the Button atom component, covering all props,
 * events, accessibility, and visual variants.
 */

import { render, fireEvent, screen } from '@testing-library/svelte/svelte5';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button.svelte';

describe('Button Component', () => {
	describe('Basic Rendering', () => {
		it('renders with default props', () => {
			render(Button, { 
				props: {},
				children: 'Click me'
			});
			
			const button = screen.getByRole('button');
			expect(button).toBeInTheDocument();
			expect(button).toHaveAttribute('type', 'button');
			expect(button).toHaveTextContent('Click me');
		});

		it('renders with slot content', () => {
			const { container } = render(Button, {
				props: {},
				children: 'Custom Button Text'
			});
			
			expect(container.textContent).toContain('Custom Button Text');
		});
	});

	describe('Props', () => {
		it('applies correct variant classes', async () => {
			const { rerender } = render(Button, { 
				props: { variant: 'primary' },
				children: 'Primary'
			});
			
			let button = screen.getByRole('button');
			expect(button).toHaveClass('bg-blue-600');
			
			await rerender({ props: { variant: 'secondary' } });
			expect(button).toHaveClass('bg-gray-200');
			
			await rerender({ props: { variant: 'danger' } });
			expect(button).toHaveClass('bg-red-600');
			
			await rerender({ props: { variant: 'ghost' } });
			expect(button).toHaveClass('bg-transparent');
		});

		it('applies correct size classes', async () => {
			const { rerender } = render(Button, { 
				props: { size: 'small' },
				children: 'Small'
			});
			
			let button = screen.getByRole('button');
			expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
			
			await rerender({ props: { size: 'medium' } });
			expect(button).toHaveClass('px-4', 'py-2', 'text-base');
			
			await rerender({ props: { size: 'large' } });
			expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
		});

		it('handles disabled state correctly', () => {
			render(Button, { 
				props: { disabled: true },
				children: 'Disabled'
			});
			
			const button = screen.getByRole('button');
			expect(button).toBeDisabled();
			expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
		});

		it('handles loading state correctly', () => {
			render(Button, { 
				props: { loading: true },
				children: 'Loading'
			});
			
			const button = screen.getByRole('button');
			expect(button).toHaveTextContent('Loading...');
			expect(button.querySelector('svg')).toBeInTheDocument();
		});

		it('applies fullWidth class when specified', () => {
			render(Button, { 
				props: { fullWidth: true },
				children: 'Full Width'
			});
			
			const button = screen.getByRole('button');
			expect(button).toHaveClass('w-full');
		});

		it('sets correct button type', async () => {
			const { rerender } = render(Button, { 
				props: { type: 'submit' },
				children: 'Submit'
			});
			
			let button = screen.getByRole('button');
			expect(button).toHaveAttribute('type', 'submit');
			
			await rerender({ props: { type: 'reset' } });
			expect(button).toHaveAttribute('type', 'reset');
		});

		it('sets aria-label when provided', () => {
			render(Button, { 
				props: { ariaLabel: 'Custom aria label' },
				children: 'Button'
			});
			
			const button = screen.getByRole('button');
			expect(button).toHaveAttribute('aria-label', 'Custom aria label');
		});
	});

	describe('Events', () => {
		it('dispatches click event when clicked', async () => {
			const mockHandler = vi.fn();
			render(Button, { 
				props: { onclick: mockHandler },
				children: 'Click me'
			});
			
			const button = screen.getByRole('button');
			await fireEvent.click(button);
			
			expect(mockHandler).toHaveBeenCalledTimes(1);
		});

		it('does not dispatch click event when disabled', async () => {
			const mockHandler = vi.fn();
			render(Button, { 
				props: { 
					disabled: true,
					onclick: mockHandler 
				},
				children: 'Disabled'
			});
			
			const button = screen.getByRole('button');
			await fireEvent.click(button);
			
			// Disabled buttons don't fire click events
			expect(mockHandler).not.toHaveBeenCalled();
		});

		it('does not dispatch click event when loading', async () => {
			const mockHandler = vi.fn();
			render(Button, { 
				props: { 
					loading: true,
					onclick: mockHandler 
				},
				children: 'Loading'
			});
			
			const button = screen.getByRole('button');
			await fireEvent.click(button);
			
			// Loading buttons should not dispatch click events
			expect(mockHandler).not.toHaveBeenCalled();
		});
	});

	describe('Accessibility', () => {
		it('has proper focus styles', () => {
			render(Button, { 
				props: {},
				children: 'Focus me'
			});
			
			const button = screen.getByRole('button');
			expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
		});

		it('is keyboard accessible', async () => {
			render(Button, { 
				props: {},
				children: 'Keyboard accessible'
			});
			
			const button = screen.getByRole('button');
			button.focus();
			
			// Verify the button can receive focus
			expect(button).toHaveFocus();
		});

		it('has proper aria attributes for loading state', () => {
			render(Button, { 
				props: { loading: true },
				children: 'Loading'
			});
			
			const button = screen.getByRole('button');
			const spinner = button.querySelector('svg');
			expect(spinner).toHaveAttribute('aria-hidden', 'true');
		});
	});

	describe('Visual Regression', () => {
		it('maintains consistent class structure', () => {
			render(Button, { 
				props: { variant: 'primary', size: 'medium' },
				children: 'Test'
			});
			
			const button = screen.getByRole('button');
			const classes = button.className.split(' ');
			
			// Check for essential classes
			expect(classes).toContain('inline-flex');
			expect(classes).toContain('items-center');
			expect(classes).toContain('justify-center');
			expect(classes).toContain('font-medium');
			expect(classes).toContain('rounded-lg');
			expect(classes).toContain('transition-all');
		});
	});
});