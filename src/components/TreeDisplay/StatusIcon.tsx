
"use client";
import React from 'react';
import { NodeStatus } from '@/types';
import { CheckCircle2, XCircle, Loader2, CircleSlash, GitFork, HelpCircle } from 'lucide-react';

interface StatusIconProps {
  status: NodeStatus;
  className?: string;
}

const StatusIcon: React.FC<StatusIconProps> = ({ status, className = "h-4 w-4" }) => {
  switch (status) {
    case NodeStatus.Pending:
      return <CircleSlash className={`${className} text-muted-foreground`} title="Pending" />;
    case NodeStatus.Running:
      return <Loader2 className={`${className} animate-spin text-blue-500`} title="Running" />;
    case NodeStatus.Completed:
      return <CheckCircle2 className={`${className} text-accent`} title="Completed" />;
    case NodeStatus.Failed:
      return <XCircle className={`${className} text-destructive`} title="Failed" />;
    case NodeStatus.Decomposed:
      return <GitFork className={`${className} text-purple-500`} title="Decomposed" />;
    default:
      return <HelpCircle className={`${className} text-gray-400`} title="Unknown Status" />;
  }
};

export default StatusIcon;
