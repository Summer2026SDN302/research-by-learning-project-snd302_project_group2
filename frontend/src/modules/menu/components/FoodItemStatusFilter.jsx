// const OPTIONS = [
//   { value: '', label: 'Tất cả' },
//   { value: 'false', label: 'Đang bán' },
//   { value: 'true', label: 'Ngừng bán' },
// ];

// const FoodItemStatusFilter = ({ value = '', onChange = () => {} }) => (
//   <div className="flex items-center gap-2">
//     <span className="text-label-md font-semibold text-on-surface-variant shrink-0">Trạng thái:</span>
//     <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant">
//       {OPTIONS.map((option) => {
//         const selected = value === option.value;
//         return (
//           <button
//             key={option.value || 'all'}
//             type="button"
//             onClick={() => onChange(option.value)}
//             className={`px-3 py-1 rounded-md text-label-md font-semibold transition-all ${
//               selected
//                 ? 'bg-surface shadow-sm text-on-surface'
//                 : 'text-on-surface-variant hover:text-on-surface'
//             }`}
//           >
//             {option.label}
//           </button>
//         );
//       })}
//     </div>
//   </div>
// );

// export default FoodItemStatusFilter;
