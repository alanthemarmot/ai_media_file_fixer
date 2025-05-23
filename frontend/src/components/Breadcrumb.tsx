import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {items.map((item, index) => (
          <li key={item.label} className="inline-flex items-center">
            {index === 0 ? (
              <div className={`inline-flex items-center ${item.onClick ? 'cursor-pointer hover:text-blue-600' : ''}`} onClick={item.onClick}>
                <HomeIcon className="w-4 h-4 mr-1" />
                <span className={`${index === items.length - 1 ? 'font-medium text-blue-600' : 'text-gray-500'}`}>{item.label}</span>
              </div>
            ) : (
              <>
                <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
                <span 
                  className={`${index === items.length - 1 ? 'font-medium text-blue-600' : 'text-gray-500'} ${item.onClick ? 'cursor-pointer hover:text-blue-600' : ''}`}
                  onClick={item.onClick}
                >
                  {item.label}
                </span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
