import React, { useState, useCallback, memo } from 'react';
import { X, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Eye } from 'lucide-react';
import { Button } from '@/components/common';
import type { TextEditorState } from '@/types/canvas';

interface TextEditorProps {
  isOpen: boolean;
  initialState?: Partial<TextEditorState>;
  onSave: (textState: TextEditorState) => void;
  onCancel: () => void;
}

const FONT_FAMILIES = [
  'Arial',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Poppins'
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32];

const TEXT_COLORS = [
  '#000000', '#FFFFFF', '#EF4444', '#3B82F6', '#10B981', 
  '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
];

export const TextEditor: React.FC<TextEditorProps> = memo(({
  isOpen,
  initialState = {},
  onSave,
  onCancel
}) => {
  const [textState, setTextState] = useState<TextEditorState>({
    text: initialState.text || 'Texto',
    fontSize: initialState.fontSize || 16,
    fontFamily: initialState.fontFamily || 'Arial',
    bold: initialState.bold || false,
    italic: initialState.italic || false,
    underline: initialState.underline || false,
    alignment: initialState.alignment || 'left',
    color: initialState.color || '#000000',
    backgroundColor: initialState.backgroundColor || undefined,
    transparency: initialState.transparency || 100,
  });

  const updateTextState = useCallback((updates: Partial<TextEditorState>) => {
    setTextState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSave = useCallback(() => {
    onSave(textState);
  }, [textState, onSave]);

  const getPreviewStyle = useCallback((): React.CSSProperties => {
    return {
      fontFamily: textState.fontFamily,
      fontSize: `${textState.fontSize}px`,
      fontWeight: textState.bold ? 'bold' : 'normal',
      fontStyle: textState.italic ? 'italic' : 'normal',
      textDecoration: textState.underline ? 'underline' : 'none',
      textAlign: textState.alignment,
      color: textState.color,
      backgroundColor: textState.backgroundColor || 'transparent',
      opacity: textState.transparency / 100,
      padding: '8px',
      border: '1px dashed #ccc',
      borderRadius: '4px',
      minHeight: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: textState.alignment === 'center' ? 'center' : 
                     textState.alignment === 'right' ? 'flex-end' : 'flex-start'
    };
  }, [textState]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Adicionar Texto
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Texto
            </label>
            <textarea
              value={textState.text}
              onChange={(e) => updateTextState({ text: e.target.value })}
              placeholder="Digite seu texto aqui..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
            />
          </div>

          {/* Font Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Font Family */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fonte
              </label>
              <select
                value={textState.fontFamily}
                onChange={(e) => updateTextState({ fontFamily: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {FONT_FAMILIES.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tamanho
              </label>
              <select
                value={textState.fontSize}
                onChange={(e) => updateTextState({ fontSize: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {FONT_SIZES.map(size => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Text Styles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estilos
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => updateTextState({ bold: !textState.bold })}
                className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
                  textState.bold
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                }`}
                title="Negrito"
              >
                <Bold size={16} />
              </button>
              <button
                onClick={() => updateTextState({ italic: !textState.italic })}
                className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
                  textState.italic
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                }`}
                title="Itálico"
              >
                <Italic size={16} />
              </button>
              <button
                onClick={() => updateTextState({ underline: !textState.underline })}
                className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
                  textState.underline
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                }`}
                title="Sublinhado"
              >
                <Underline size={16} />
              </button>
            </div>
          </div>

          {/* Text Alignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alinhamento
            </label>
            <div className="flex gap-2">
              {[
                { value: 'left', icon: AlignLeft, label: 'Esquerda' },
                { value: 'center', icon: AlignCenter, label: 'Centro' },
                { value: 'right', icon: AlignRight, label: 'Direita' },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => updateTextState({ alignment: value as 'left' | 'center' | 'right' })}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
                    textState.alignment === value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                  }`}
                  title={label}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cor do Texto
            </label>
            <div className="flex flex-wrap gap-2">
              {TEXT_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => updateTextState({ color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    textState.color === color
                      ? 'border-gray-800 dark:border-gray-200 ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Cor: ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cor de Fundo (Opcional)
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateTextState({ backgroundColor: undefined })}
                className={`w-8 h-8 rounded-full border-2 transition-all bg-transparent ${
                  !textState.backgroundColor
                    ? 'border-gray-800 dark:border-gray-200 ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                title="Transparente"
              >
                <X size={12} className="mx-auto text-gray-400" />
              </button>
              {TEXT_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => updateTextState({ backgroundColor: color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    textState.backgroundColor === color
                      ? 'border-gray-800 dark:border-gray-200 ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Fundo: ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Transparency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transparência: {textState.transparency}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={textState.transparency}
              onChange={(e) => updateTextState({ transparency: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Eye size={16} />
              Preview
            </label>
            <div
              style={getPreviewStyle()}
              className="bg-gray-50 dark:bg-gray-700"
            >
              {textState.text || 'Texto'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Adicionar Texto
          </Button>
        </div>
      </div>
    </div>
  );
});

TextEditor.displayName = 'TextEditor';