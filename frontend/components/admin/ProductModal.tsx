'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Product, ProductSize } from '@/types';
import { X, Plus, Trash2, Loader2, Upload } from 'lucide-react';
// I'll build a custom simple modal to avoid headlessui dep if not installed.
// "Modal-based editing".

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product | null;
    onSave: (data: Partial<Product>) => Promise<void>;
}

export default function ProductModal({ isOpen, onClose, product, onSave }: ProductModalProps) {
    const [isSaving, setIsSaving] = useState(false);

    const { register, control, handleSubmit, reset, setValue } = useForm<Partial<Product>>({
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            category: '',
            images: [],
            sizes: [{ size: 'S', stock: 10 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "sizes" as any
    });

    useEffect(() => {
        if (product) {
            reset(product);
        } else {
            reset({
                name: '',
                description: '',
                price: 0,
                category: '',
                images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800'], // Default placeholder
                sizes: [{ size: 'S', stock: 10 }]
            });
        }
    }, [product, isOpen, reset]);

    const onSubmit = async (data: Partial<Product>) => {
        setIsSaving(true);
        try {
            await onSave({ ...data, id: product?.id || undefined }); // Pass id if editing
            onClose();
        } catch (e) {
            alert('Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold">{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product Name</label>
                            <input {...register('name')} className="w-full p-2 border rounded-md" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <select {...register('category')} className="w-full p-2 border rounded-md" required>
                                <option value="">Select Category</option>
                                <option value="Dresses">Dresses</option>
                                <option value="Tops">Tops</option>
                                <option value="Bottoms">Bottoms</option>
                                <option value="Outerwear">Outerwear</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea {...register('description')} className="w-full p-2 border rounded-md h-24" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Base Price ($)</label>
                            <input {...register('price', { valueAsNumber: true })} type="number" step="0.01" className="w-full p-2 border rounded-md" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Image URL (Placeholder)</label>
                            <div className="flex gap-2">
                                <input {...register('images.0')} className="w-full p-2 border rounded-md" required />
                                <button type="button" className="p-2 border rounded-md hover:bg-secondary"><Upload className="w-5 h-5" /></button>
                            </div>
                            <p className="text-xs text-muted-foreground">Upload multiple images not fully implemented in mock.</p>
                        </div>
                    </div>

                    <div className="space-y-3 border rounded-md p-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">Variants (Size & Stock)</label>
                            <button type="button" onClick={() => append({ size: 'M', stock: 10 })} className="text-xs flex items-center text-primary">
                                <Plus className="w-3 h-3 mr-1" /> Add Variant
                            </button>
                        </div>

                        <div className="space-y-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-center">
                                    <input {...register(`sizes.${index}.size` as const)} placeholder="Size" className="w-20 p-2 border rounded-md" />
                                    <input {...register(`sizes.${index}.stock` as const, { valueAsNumber: true })} type="number" placeholder="Stock" className="w-24 p-2 border rounded-md" />
                                    <input {...register(`sizes.${index}.price` as const, { valueAsNumber: true })} type="number" placeholder="Override Price" className="w-24 p-2 border rounded-md" />
                                    <button type="button" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-secondary">Cancel</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center">
                            {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Save Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
