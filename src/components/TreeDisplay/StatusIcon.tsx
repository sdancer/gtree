
"use client";
import React from 'react';
import { NodeStatus } from '@/types';
import { CheckCircle2, XCircle, Hourglass, CircleSlash, GitFork, HelpCircle } from 'lucide-react'; // Replaced Loader2 with Hourglass

interface StatusIconProps {
  status: NodeStatus;
  className?: string;
}

const StatusIcon: React.FC<StatusIconProps> = ({ status, className = "h-4 w-4" }) => {
  switch (status) {
    case NodeStatus.Pending:
      return <CircleSlash className={`${className} text-muted-foreground`} title="Pending" />;
    case NodeStatus.Running:
      return <Hourglass className={`${className} text-blue-500`} title="Running" />; // Changed to Hourglass, removed animate-spin
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
