import React, { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';

const AccountMultiSelect = ({
  value = '',
  options = [],
  onChange,
  placeholder = 'Search...',
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedValues = value
    ? value.split(',').map(item => item.trim()).filter(Boolean)
    : [];

  const filteredOptions = options.filter(option =>
    String(option)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleSelect = (option) => {
    const currentValues = [...selectedValues];

    if (currentValues.includes(option)) {
      const indexToRemove = currentValues.indexOf(option);
      currentValues.splice(indexToRemove, 1);
    } else {
      currentValues.push(option);
    }

    onChange(currentValues.join(','));

    // IMPORTANT:
    // Close dropdown after every single selection.
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleRemove = (option) => {
    const currentValues = [...selectedValues];
    const indexToRemove = currentValues.indexOf(option);

    if (indexToRemove > -1) {
      currentValues.splice(indexToRemove, 1);
    }

    onChange(currentValues.join(','));
  };

  return (
    <div
      ref={containerRef}
      className="filter-property-dropdown-container"
      style={{
        position: 'relative',
        width: '100%'
      }}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
        }}
        onClick={() => {
          setIsOpen(true);
        }}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r)',
          fontSize: '13px',
          background: 'var(--surface)',
          color: 'var(--text)',
          boxSizing: 'border-box'
        }}
      />

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 100,
            maxHeight: '200px',
            overflowY: 'auto',
            marginTop: '4px'
          }}
        >
          {loading ? (
            <div
              style={{
                padding: '10px 12px',
                fontSize: '13px',
                color: 'var(--text-3)'
              }}
            >
              Loading options, please wait...
            </div>
          ) : filteredOptions.length === 0 ? (
            <div
              style={{
                padding: '10px 12px',
                fontSize: '13px',
                color: 'var(--text-3)'
              }}
            >
              No options found
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = selectedValues.includes(String(option));

              return (
                <div
                  key={String(option)}
                  onClick={() => handleSelect(String(option))}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'var(--text)',
                    borderBottom: '1px solid var(--border-soft)',
                    backgroundColor: isSelected
                      ? 'var(--blue-600)15'
                      : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--gray-100)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isSelected
                      ? 'var(--blue-600)15'
                      : 'transparent';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{option}</span>

                    {isSelected && (
                      <Check
                        size={14}
                        style={{ color: 'var(--blue-600)' }}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {selectedValues.length > 0 && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: 'var(--text-3)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px'
          }}
        >
          {selectedValues.map((selectedValue, index) => (
            <span
              key={`${selectedValue}-${index}`}
              style={{
                background: 'var(--blue-600)15',
                color: 'var(--blue-600)',
                padding: '2px 6px',
                borderRadius: 'var(--r)',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {selectedValue}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(selectedValue);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--blue-600)',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '12px',
                  lineHeight: 1,
                  width: '14px',
                  height: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={`Remove ${selectedValue}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountMultiSelect;