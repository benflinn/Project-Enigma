import React, { useEffect } from 'react';
import { useWorkstationStore } from '../../state/workstationStore';
import { getTrainingMessageById } from '../../engine/cryptanalysis/interceptArchive';
import { InterceptArchivePanel } from './InterceptArchivePanel';
import { MessageInspector } from './MessageInspector';
import { StatisticalAnalysisPanel } from './StatisticalAnalysisPanel';
import { CribTestingPanel } from './CribTestingPanel';
import { AutomatedSearchPanel } from './AutomatedSearchPanel';
import { ResultsPanel } from './ResultsPanel';
import { InvestigationNotebookPanel } from './InvestigationNotebookPanel';
import {
  Radio,
  BarChart3,
  Search,
  Cpu,
  Award,
  BookOpen,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const WorkstationView: React.FC = () => {
  const {
    selectedMessageId,
    controlMode,
    activeTab,
    cribInput,
    searchBounds,
    searchProgress,
    candidateResults,
    selectedCandidate,
    notebookEntries,
    isSearching,
    selectMessage,
    setControlMode,
    setActiveTab,
    setCribInput,
    setSelectedCribOffset,
    updateSearchBounds,
    startSearch,
    cancelSearch,
    selectCandidate,
    saveToNotebook,
    deleteNotebookEntry,
    loadNotebook,
    loadUnlocks,
    transferCandidateToSimulator,
    transferConfigToSimulator,
  } = useWorkstationStore();

  useEffect(() => {
    loadNotebook();
    loadUnlocks();
  }, [loadNotebook, loadUnlocks]);

  const currentMessage = getTrainingMessageById(selectedMessageId);

  const handleSendCribToSearch = (crib: string, offset: number) => {
    setCribInput(crib);
    setSelectedCribOffset(offset);
    updateSearchBounds({
      scoringMethod: 'CRIB_MATCH',
      crib: { text: crib, offset },
    });
    setActiveTab('search');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Workstation Research Laboratory Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/50 text-amber-400 text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Bletchley Park Research Laboratory • Version 0.2
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-stone-100">
            Cryptanalysis Workstation
          </h1>
          <p className="text-stone-400 font-mono text-xs sm:text-sm mt-1 max-w-2xl">
            Autonomous multi-threaded cryptanalytic laboratory for analyzing intercepts, dragging cribs, and executing bounded keyspace searches.
          </p>
        </div>

        {/* Basic vs Advanced Control Mode Switcher */}
        <div className="flex items-center gap-2 bg-stone-950 p-1.5 rounded-xl border border-stone-800 self-start md:self-auto">
          <button
            onClick={() => setControlMode('basic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              controlMode === 'basic'
                ? 'bg-amber-950/90 text-amber-300 border border-amber-600/50 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Basic Mode</span>
          </button>

          <button
            onClick={() => setControlMode('advanced')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              controlMode === 'advanced'
                ? 'bg-amber-950/90 text-amber-300 border border-amber-600/50 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Advanced Mode</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-stone-800">
        <button
          onClick={() => setActiveTab('archive')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-colors shrink-0 cursor-pointer ${
            activeTab === 'archive'
              ? 'bg-stone-900 text-amber-400 border border-amber-600/40 shadow'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Intercept Archive</span>
        </button>

        <button
          onClick={() => setActiveTab('statistics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-colors shrink-0 cursor-pointer ${
            activeTab === 'statistics'
              ? 'bg-stone-900 text-amber-400 border border-amber-600/40 shadow'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Statistical Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab('crib')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-colors shrink-0 cursor-pointer ${
            activeTab === 'crib'
              ? 'bg-stone-900 text-amber-400 border border-amber-600/40 shadow'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Crib-Testing Tool</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-colors shrink-0 cursor-pointer ${
            activeTab === 'search'
              ? 'bg-stone-900 text-amber-400 border border-amber-600/40 shadow'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
          }`}
        >
          <Cpu className={`w-4 h-4 ${isSearching ? 'text-amber-400 animate-spin' : ''}`} />
          <span>Automated Search</span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-colors shrink-0 cursor-pointer ${
            activeTab === 'results'
              ? 'bg-stone-900 text-amber-400 border border-amber-600/40 shadow'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Candidate Results {candidateResults.length > 0 && `(${candidateResults.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('notebook')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-colors shrink-0 cursor-pointer ${
            activeTab === 'notebook'
              ? 'bg-stone-900 text-amber-400 border border-amber-600/40 shadow'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Notebook {notebookEntries.length > 0 && `(${notebookEntries.length})`}</span>
        </button>
      </div>

      {/* Active Selected Message Inspector (shown above analysis tools) */}
      {currentMessage && activeTab !== 'archive' && (
        <MessageInspector
          message={currentMessage}
          onSendCribToSearch={handleSendCribToSearch}
          onNavigateToTab={(tab) => setActiveTab(tab)}
        />
      )}

      {/* Active Tab View Rendering */}
      {activeTab === 'archive' && (
        <InterceptArchivePanel
          selectedMessageId={selectedMessageId}
          onSelectMessage={(id) => {
            selectMessage(id);
            setActiveTab('search');
          }}
        />
      )}

      {activeTab === 'statistics' && currentMessage && (
        <StatisticalAnalysisPanel
          ciphertext={currentMessage.ciphertext}
          samplePlaintext={selectedCandidate?.plaintext}
        />
      )}

      {activeTab === 'crib' && currentMessage && (
        <CribTestingPanel
          ciphertext={currentMessage.ciphertext}
          initialCrib={cribInput || 'WEATHER'}
          onSelectOffset={(offset, crib) => {
            setSelectedCribOffset(offset);
            setCribInput(crib);
          }}
          onSendToSearch={handleSendCribToSearch}
        />
      )}

      {activeTab === 'search' && (
        <AutomatedSearchPanel
          bounds={searchBounds}
          isSearching={isSearching}
          progress={searchProgress}
          controlMode={controlMode}
          onUpdateBounds={updateSearchBounds}
          onStartSearch={startSearch}
          onCancelSearch={cancelSearch}
        />
      )}

      {activeTab === 'results' && (
        <ResultsPanel
          candidates={candidateResults}
          selectedCandidate={selectedCandidate}
          onSelectCandidate={selectCandidate}
          onTransferToSimulator={transferCandidateToSimulator}
          onSaveToNotebook={(title, notes, cand) => {
            saveToNotebook(title, notes, cand.config, cand.score, cand.plaintext);
          }}
        />
      )}

      {activeTab === 'notebook' && (
        <InvestigationNotebookPanel
          entries={notebookEntries}
          onDeleteEntry={deleteNotebookEntry}
          onTransferToSimulator={transferConfigToSimulator}
          onAddNewEntry={(title, notes, config, score, plaintext) => {
            saveToNotebook(title, notes, config, score, plaintext);
          }}
          currentConfig={selectedCandidate?.config}
        />
      )}
    </div>
  );
};
