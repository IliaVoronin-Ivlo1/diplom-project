'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './SearchableDropdown.module.css';

interface SearchableDropdownProps<T> {
  items: T[];
  selectedItem: T | null;
  onSelect: (item: T) => void;
  getDisplayText: (item: T) => string;
  placeholder?: string;
  className?: string;
}

export default function SearchableDropdown<T>({
  items,
  selectedItem,
  onSelect,
  getDisplayText,
  placeholder = 'Поиск...',
  className = ''
}: SearchableDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredItems = items.filter(item =>
    getDisplayText(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (item: T) => {
    onSelect(item);
    setIsOpen(false);
    setSearchTerm('');
  };

  const displayValue = selectedItem ? getDisplayText(selectedItem) : '';

  return (
    <div className={`${styles.dropdown} ${className}`} ref={dropdownRef}>
      <div
        className={styles.inputWrapper}
        onClick={(e) => {
          e.stopPropagation();
          if (!isOpen) {
            setIsOpen(true);
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }
        }}
      >
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={isOpen ? searchTerm : displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) {
              setIsOpen(true);
            }
          }}
          onFocus={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
        <svg
          className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {isOpen && (
        <div className={styles.dropdownList}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div
                key={index}
                className={styles.dropdownItem}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(item);
                }}
              >
                {getDisplayText(item)}
              </div>
            ))
          ) : (
            <div className={styles.noResults}>Ничего не найдено</div>
          )}
        </div>
      )}
    </div>
  );
}
