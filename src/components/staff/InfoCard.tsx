'use client';

import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';

interface InfoItem {
    label: string;
    value: string | number | undefined;
}

interface InfoCardProps {
    title: string;
    items: InfoItem[];
    columns?: 1 | 2 | 3;
    delay?: number;
    onEdit?: () => void;
}

const InfoCard = ({ title, items, columns = 2, delay = 0, onEdit }: InfoCardProps) => {

    const gridCols = {
        1: 'md:grid-cols-1',
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-6 relative overflow-hidden group hover:shadow-md transition-shadow duration-300"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-foreground">{title}</h3>
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer p-1 rounded-full hover:bg-muted"
                    >
                        <MoreHorizontal size={20} />
                    </button>
                )}
            </div>

            <div className={`grid grid-cols-1 ${gridCols[columns]} gap-y-6 gap-x-8`}>
                {items.map((item, index) => (
                    <div key={index} className="flex flex-col">
                        <span className="text-sm font-semibold text-muted-foreground mb-1">
                            {item.label}
                        </span>
                        <span className="text-base font-medium text-foreground break-words">
                            {item.value || '-'}
                        </span>
                        <div className="h-[1px] w-full bg-border mt-2 opacity-50" />
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default InfoCard;
