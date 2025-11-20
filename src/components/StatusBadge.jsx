import clsx from 'clsx';

const StatusBadge = ({ status }) => {
    const styles = {
        pagado: 'bg-green-100 text-green-800 border-green-200',
        seña: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        consultado: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    const labels = {
        pagado: 'Pagado',
        seña: 'Seña',
        consultado: 'Consultado',
    };

    const normalizedStatus = status?.toLowerCase() || 'consultado';

    return (
        <span
            className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                styles[normalizedStatus] || styles.consultado
            )}
        >
            {labels[normalizedStatus] || status}
        </span>
    );
};

export default StatusBadge;
