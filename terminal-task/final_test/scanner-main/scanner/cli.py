import click
import os

class ComplexCLI(click.Group):
    def list_commands(self, ctx):
        rv = []
        for filename in os.listdir(os.path.join(os.path.dirname(__file__), "commands")):
            if filename.endswith(".py") and not filename.startswith("__"):
                rv.append(filename.replace('.py',''))
        rv.sort()
        return rv

    def get_command(self, ctx, name):
        try:
            mod = __import__(f"scanner.commands.{name}", None, None, ["cli"])
        except ImportError:
            return
        return mod.cli

@click.command(cls=ComplexCLI)
def cli():
    """Welcome to Scanner"""
    pass