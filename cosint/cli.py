import sys
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt
from .agent import get_cosint_agent

console = Console()

def run_cli():
    console.print(Panel.fit(
        "[bold blue]COSINT[/bold blue]\n"
        "[italic]Congress Open Source Intelligence Tool[/italic]\n\n"
        "Ask me anything about Congress representatives!",
        title="Welcome",
        border_style="green"
    ))

    try:
        agent_executor = get_cosint_agent()
    except Exception as e:
        console.print(f"[bold red]Error initializing agent:[/bold red] {e}")
        sys.exit(1)

    chat_history = []

    while True:
        try:
            query = Prompt.ask("\n[bold cyan]Query[/bold cyan]")
            
            if query.lower() in ["exit", "quit", "q"]:
                console.print("[yellow]Goodbye![/yellow]")
                break
            
            if not query.strip():
                continue

            with console.status("[bold green]Searching Congress data...[/bold green]"):
                response = agent_executor.invoke({
                    "input": query,
                    "chat_history": chat_history
                })
            
            console.print("\n[bold green]COSINT Response:[/bold green]")
            console.print(response["output"])

            # Update chat history
            chat_history.append(("human", query))
            chat_history.append(("assistant", response["output"]))
            
            # Keep history manageable (last 10 interactions)
            if len(chat_history) > 20:
                chat_history = chat_history[-20:]

        except KeyboardInterrupt:
            console.print("\n[yellow]Goodbye![/yellow]")
            break
        except Exception as e:
            console.print(f"[bold red]An error occurred:[/bold red] {e}")

if __name__ == "__main__":
    run_cli()
