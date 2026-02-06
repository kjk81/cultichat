- basic UI
- webllm load
- multiagentic loading
- supabase auth, saving into db, fetching, crud	


Goal: give the experience of another life and growth for users through perceived cultivation growth, like many fictional comics.

agents:

act generator (act cultivation specific narrative outliner, detailing what companions show, what new characters, what events, etc, runs if player parser determines act end)

companion integrator (determines what companions may show up (pulling info) and incorporates them into the act)

act emotionifier (refines act generator output to highlight character emotional growth. Revises into a stronger narrative experience.)

scene generator (runs for each scene if given instruction by act or scene; writes each scene well-written)

player parser (integrate user input to current act, ensuring balance, conflict, and good narrative design and updating the act outline where necessary. Updates users stats. Give description of current events to state checker)

state checker (determine if act ended and give prompt for act generator if so, else give instruction for next scene generator.)

minimum persist:
cultivation stage - (Enum int)
satisfaction - ()
techniques (array with string, int)
companions (array with companion models)
current act outline (string)
current goal (string)
physical description
personality


companion model
name
current status
physical description
personality
ability description
closeness