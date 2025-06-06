
import React from 'react';
import MessageSender from './MessageSender';

interface MessageTemplate {
  id: number;
  title: string;
  content?: string;
}

interface QuickMessageSenderProps {
  templates: MessageTemplate[];
  onUseTemplate: (template: MessageTemplate) => void;
}

const QuickMessageSender = ({ templates }: QuickMessageSenderProps) => {
  return <MessageSender templates={templates} />;
};

export default QuickMessageSender;
