# GroupFormer

A web app that helps instructors create balanced groups for their classes. Built with Angular and deployed on Vercel.

## 🔗 Links

- **Live Site**: [group-former-3cg9pbfxi-moefedailys-projects.vercel.app](https://group-former-875o5fbnf-moefedailys-projects.vercel.app/)
- **Figma Design**: [GroupMaker Design](https://www.figma.com/design/vtjnN1k3KxhkQf6D2LFoeY/GroupMaker?node-id=0-1&t=RbnGPpvlqSNPnZ5T-0)

## Demo Credentials

To test the app, use:

- **Username**: `admin`
- **Password**: `admin123`

### Key Features

- **Smart Group Creation**: Balance groups based on criteria like age, technical level, French fluency, gender, and personality profiles
- **History Tracking**: Never recreate the same groups - the app remembers past combinations
- **Manual Adjustments**: Drag and drop people between groups if needed
- **Responsive Design**: Works on mobile, tablet, and desktop

## How it works

1. Create a list and add people with their attributes
2. Choose how many groups you want and which criteria to balance
3. Generate groups automatically or adjust them manually
4. Save the results - they're stored in your history

## Tech Stack

- **Frontend**: Angular with TypeScript
- **Styling**: SCSS with modern design patterns
- **Deployment**: Vercel
- **Testing**: Jest for unit tests
- **Data**: Local storage (no database yet)

## Testing

Unit tests are implemented with Jest, focusing on:

- Group generation algorithms
- Balancing criteria logic
- Data validation

Run test for group service only with:

```bash
npx jest src/app/services/group.service.spec.ts
```

## Local Development

```bash
# Install dependencies
npm install

# Start  server
ng s

```
