import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, Paperclip, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export function KanbanBoard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([
    { id: 'backlog', name: 'Backlog', order: 0 },
    { id: 'todo', name: 'To Do', order: 1 },
    { id: 'in_progress', name: 'In Progress', order: 2 },
    { id: 'review', name: 'Review / QC', order: 3 },
    { id: 'completed', name: 'Completed', order: 4 },
  ]);

  useEffect(() => {
    // In a real app, stages might be in DB, for now hardcode for simplicity
    const q = query(collection(db, 'tasks'));
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStageId = destination.droppableId;
    
    // Optimistic update
    const updatedTasks = tasks.map(t => t.id === draggableId ? { ...t, stageId: newStageId } : t);
    setTasks(updatedTasks);

    await updateDoc(doc(db, 'tasks', draggableId), {
      stageId: newStageId,
      updatedAt: new Date().toISOString(),
      ...(newStageId === 'completed' ? { completedAt: new Date().toISOString() } : {})
    });
  };

  const handleAddTask = async (stageId: string) => {
    const title = prompt("Task title");
    if (!title) return;
    await addDoc(collection(db, 'tasks'), {
      title,
      stageId,
      priority: 'Medium',
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Task Pipeline</h1>
          <p className="text-gray-500 mt-1">Manage project workflow and delivery.</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-gray-50">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex h-full gap-6">
            {stages.sort((a,b)=>a.order - b.order).map(stage => {
              const stageTasks = tasks.filter(t => t.stageId === stage.id);
              
              return (
                <div key={stage.id} className="flex flex-col w-80 shrink-0">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="font-semibold text-gray-700 text-sm">{stage.name} <span className="text-gray-400 font-normal ml-1">{stageTasks.length}</span></h3>
                    <button onClick={() => handleAddTask(stage.id)} className="text-gray-400 hover:text-gray-700">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto rounded-lg ${snapshot.isDraggingOver ? 'bg-indigo-50' : ''}`}
                      >
                        <div className="space-y-3 min-h-[100px]">
                          {stageTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white p-4 rounded-xl border ${snapshot.isDragging ? 'border-indigo-500 shadow-lg' : 'border-gray-200 shadow-sm'} group`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm ${task.priority === 'High' ? 'bg-red-50 text-red-600' : task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>
                                      {task.priority || 'Task'}
                                    </span>
                                    <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <h4 className="font-medium text-gray-900 mb-1 leading-snug">{task.title}</h4>
                                  {task.clientId && <p className="text-xs text-gray-500 mb-3 truncate">Client A</p>}
                                  
                                  <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-3 text-gray-400">
                                      {task.attachments?.length > 0 && (
                                        <div className="flex items-center gap-1 text-xs font-medium">
                                          <Paperclip className="w-3.5 h-3.5" />
                                          {task.attachments.length}
                                        </div>
                                      )}
                                      {task.comments?.length > 0 && (
                                        <div className="flex items-center gap-1 text-xs font-medium">
                                          <MessageSquare className="w-3.5 h-3.5" />
                                          {task.comments.length}
                                        </div>
                                      )}
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 border-2 border-white shadow-sm" title="Assigned to">
                                      U
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
