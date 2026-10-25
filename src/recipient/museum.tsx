import { createRoot } from 'react-dom/client';
import Recipient from './Recipient';
import type { RecipientProps } from '../domain/types';

declare global { interface Window { __COUPLES_DATA__: RecipientProps } }
const root = document.getElementById('root');
if (root) createRoot(root).render(<Recipient {...window.__COUPLES_DATA__} />);
