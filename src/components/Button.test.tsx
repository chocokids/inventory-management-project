import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button 组件测试', () => {
  it('应该正确渲染按钮', () => {
    render(<Button>点击我</Button>);
    expect(screen.getByText('点击我')).toBeInTheDocument();
  });

  it('应该触发 onClick 事件', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>点击</Button>);
    
    fireEvent.click(screen.getByText('点击'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应该应用 primary 样式', () => {
    render(<Button variant="primary">主要按钮</Button>);
    const button = screen.getByText('主要按钮');
    expect(button).toHaveClass('bg-coffee-500');
  });

  it('应该应用 secondary 样式', () => {
    render(<Button variant="secondary">次要按钮</Button>);
    const button = screen.getByText('次要按钮');
    expect(button).toHaveClass('bg-cream-200');
  });

  it('应该应用 danger 样式', () => {
    render(<Button variant="danger">危险按钮</Button>);
    const button = screen.getByText('危险按钮');
    expect(button).toHaveClass('bg-red-500');
  });

  it('禁用时不应触发点击事件', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>禁用按钮</Button>);
    
    fireEvent.click(screen.getByText('禁用按钮'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('应该应用自定义 className', () => {
    render(<Button className="custom-class">自定义</Button>);
    const button = screen.getByText('自定义');
    expect(button).toHaveClass('custom-class');
  });

  it('应该支持不同尺寸', () => {
    const { rerender } = render(<Button size="sm">小按钮</Button>);
    expect(screen.getByText('小按钮')).toHaveClass('text-sm');
    
    rerender(<Button size="md">中按钮</Button>);
    expect(screen.getByText('中按钮')).toHaveClass('text-base');
    
    rerender(<Button size="lg">大按钮</Button>);
    expect(screen.getByText('大按钮')).toHaveClass('text-lg');
  });
});
