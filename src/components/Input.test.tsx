import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, Select } from './Input';

describe('Input 组件测试', () => {
  it('应该渲染输入框', () => {
    render(<Input placeholder="输入文本" />);
    expect(screen.getByPlaceholderText('输入文本')).toBeInTheDocument();
  });

  it('应该显示标签', () => {
    render(<Input label="姓名" />);
    expect(screen.getByText('姓名')).toBeInTheDocument();
  });

  it('应该触发 onChange 事件', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '测试' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('应该显示错误消息', () => {
    render(<Input error="这是错误消息" />);
    expect(screen.getByText('这是错误消息')).toBeInTheDocument();
  });

  it('应该支持 required 属性', () => {
    render(<Input required />);
    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });

  it('应该支持数字类型', () => {
    render(<Input type="number" min={0} max={100} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
  });
});

describe('Select 组件测试', () => {
  const options = [
    { value: 'option1', label: '选项1' },
    { value: 'option2', label: '选项2' },
    { value: 'option3', label: '选项3' },
  ];

  it('应该渲染下拉选择框', () => {
    render(<Select options={options} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('应该显示所有选项', () => {
    render(<Select options={options} />);
    
    expect(screen.getByText('选项1')).toBeInTheDocument();
    expect(screen.getByText('选项2')).toBeInTheDocument();
    expect(screen.getByText('选项3')).toBeInTheDocument();
  });

  it('应该显示标签', () => {
    render(<Select label="职位" options={options} />);
    expect(screen.getByText('职位')).toBeInTheDocument();
  });

  it('应该触发 onChange 事件', () => {
    const handleChange = vi.fn();
    render(<Select options={options} onChange={handleChange} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('应该设置默认值', () => {
    render(<Select options={options} value="option2" onChange={vi.fn()} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('option2');
  });
});
