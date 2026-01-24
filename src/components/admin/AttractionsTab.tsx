'use client';

import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { Button } from '@/components/ui/button';
import {
  createAttraction,
  deleteAttraction,
  getAllAttractions,
  updateAttraction,
} from '@/features/attractions/actions';
import type { AttractionFormValues } from '@/features/attractions/schemas';
import { toast } from '@/lib/toast';
import type { Attraction } from '@/types';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { AttractionForm } from './AttractionForm';
import { AttractionList } from './AttractionList';

export function AttractionsTab() {
  const t = useTranslations('Admin.attractions');
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [editingAttraction, setEditingAttraction] =
    useState<Partial<Attraction> | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    setIsLoading(true);
    try {
      const data = await getAllAttractions();
      setAttractions(data as unknown as Attraction[]);
    } catch (error) {
      console.error('Failed to fetch attractions:', error);
      toast.error(t('toast.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: AttractionFormValues) => {
    setIsSubmitting(true);
    try {
      let result;
      if (isAddingNew) {
        const slug = data.title.toLowerCase().replace(/ /g, '-');
        result = await createAttraction({ success: false }, { ...data, slug });
      } else if (editingAttraction?.id) {
        const slug = data.title.toLowerCase().replace(/ /g, '-');
        result = await updateAttraction(
          { success: false },
          {
            ...data,
            id: Number(editingAttraction.id),
            slug,
          }
        );
      }

      if (result?.success) {
        toast.success(isAddingNew ? t('toast.added') : t('toast.updated'));
        setEditingAttraction(null);
        setIsAddingNew(false);
        fetchAttractions();
      } else {
        toast.error(t('toast.saveError'));
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t('toast.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const result = await deleteAttraction(
        { success: false },
        { id: Number(deleteId) }
      );

      if (result?.success) {
        toast.success(t('toast.deleted'));
        fetchAttractions();
      } else {
        toast.error(t('toast.deleteError'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(t('toast.deleteError'));
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading && !attractions.length) {
    return <div className="p-12 text-center text-gray-400">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('title')}
        action={
          !editingAttraction && (
            <Button
              onClick={() => {
                setIsAddingNew(true);
                setEditingAttraction({
                  title: '',
                  description: '',
                  longDescription: '',
                  distance: '',
                  gallery: [],
                });
              }}
              className="bg-black text-white rounded-xl">
              <Plus size={20} className="mr-2" /> {t('addNew')}
            </Button>
          )
        }
      />

      {editingAttraction && (
        <AttractionForm
          editingAttraction={editingAttraction}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          onCancel={() => {
            setEditingAttraction(null);
            setIsAddingNew(false);
          }}
          isAddingNew={isAddingNew}
        />
      )}

      <AttractionList
        attractions={attractions}
        onEdit={(attr) => {
          setIsAddingNew(false);
          setEditingAttraction(attr);
        }}
        onDelete={setDeleteId}
      />

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title={t('deleteHeading') || 'Delete Attraction'}
        description={
          t('deleteConfirm') ||
          'Are you sure you want to delete this attraction?'
        }
      />
    </div>
  );
}
