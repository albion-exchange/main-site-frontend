# Card Components

A set of reusable card components that provide consistent hover effects and styling across the application.

## Components

### Card

The base card component with hover effects (lift up with shadow).

**Props:**

- `hoverable` (boolean, default: true) - Enables hover effects
- `clickable` (boolean, default: false) - Makes the card clickable
- `padding` (string, default: '0') - Card padding
- `borderRadius` (string, default: '12px') - Card border radius
- `overflow` (string, default: 'hidden') - CSS overflow property

**Events:**

- `click` - Fired when clickable card is clicked

**Example:**

```svelte
<Card hoverable clickable on:click={handleClick}>
  <!-- Card content -->
</Card>
```

### CardImage

Displays an image with zoom-on-hover effect when the parent card is hovered.

**Props:**

- `src` (string, required) - Image source URL
- `alt` (string, required) - Image alt text
- `height` (string, default: '200px') - Image container height
- `zoomOnHover` (boolean, default: true) - Enables zoom effect on card hover

**Example:**

```svelte
<Card>
  <CardImage src="/image.jpg" alt="Description" />
</Card>
```

### CardContent

Container for card content with consistent padding.

**Props:**

- `padding` (string, default: '2rem') - Content padding

**Example:**

```svelte
<Card>
  <CardContent>
    <h3>Card Title</h3>
    <p>Card description</p>
  </CardContent>
</Card>
```

### CardActions

Container for card action buttons with responsive layout.

**Props:**

- `gap` (string, default: '1rem') - Gap between actions
- `justify` (string, default: 'flex-start') - Flexbox justify-content

**Example:**

```svelte
<Card>
  <CardContent>
    <!-- content -->
    <CardActions>
      <button class="btn-secondary">Cancel</button>
      <button class="btn-primary">Confirm</button>
    </CardActions>
  </CardContent>
</Card>
```

## Complete Example

```svelte
<script>
  import { Card, CardImage, CardContent, CardActions } from '$lib/components/ui';

  function handleCardClick() {
    // Navigate to detail page
  }

  function handleAction(event) {
    event.stopPropagation(); // Prevent card click
    // Handle specific action
  }
</script>

<Card hoverable clickable on:click={handleCardClick}>
  <CardImage
    src="/assets/product.jpg"
    alt="Product name"
    height="250px"
    zoomOnHover
  />

  <CardContent padding="1.5rem">
    <h3>Product Title</h3>
    <p>Product description goes here...</p>

    <div class="stats">
      <span>$99.00</span>
      <span>In Stock</span>
    </div>

    <CardActions gap="0.5rem">
      <button class="btn-secondary" on:click|stopPropagation={handleAction}>
        View Details
      </button>
      <button class="btn-primary" on:click|stopPropagation={handleAction}>
        Add to Cart
      </button>
    </CardActions>
  </CardContent>
</Card>
```

## Styling Notes

- The Card component provides the hover lift effect (translateY and shadow)
- CardImage automatically zooms when the parent Card is hovered
- CardActions ensures buttons are responsive and properly spaced
- All components follow the design system's clean geometric minimalism
- Use `stopPropagation` on action buttons to prevent card click when card is clickable

## Accessibility

- Clickable cards have proper ARIA roles and keyboard support
- Focus states are included for keyboard navigation
- Images should always include meaningful alt text
- Hover effects are disabled on touch devices
